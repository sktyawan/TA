#!/usr/bin/env bash
# check.sh — pemindai pola bug umum untuk proyek fullstack (skill fullstack-dev).
#
# Pakai: ./scripts/check.sh <direktori>
# Memeriksa pola dari anti-pattern & checklist SKILL.md:
#   1. Secret hardcoded (API key, password, JWT secret, DB URL, private key)
#   2. SELECT * di kode produksi
#   3. Query SQL yang disusun dengan interpolasi string (${...} / f-string)
#   4. Token sensitif disimpan di localStorage
#   5. TIMESTAMP naive (tanpa TZ) di file SQL
#
# Ini pemindai heuristik: setiap temuan perlu ditinjau manual.
# Keluar: daftar "file:baris: [KATEGORI] pesan". Exit code = jumlah temuan (0 = bersih).

set -u

if [ $# -lt 1 ]; then
  echo "Pakai: $0 <direktori>" >&2
  exit 2
fi

TARGET="$1"
if [ ! -d "$TARGET" ]; then
  echo "Direktori tidak ditemukan: $TARGET" >&2
  exit 2
fi

COUNT=0
report() { # $1=kategori $2=file:baris $3=pesan
  COUNT=$((COUNT + 1))
  printf '%s: [%s] %s\n' "$2" "$1" "$3"
}

EXCLUDES="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=__pycache__ --exclude-dir=.venv --exclude-dir=coverage"

# 1. Secret hardcoded -------------------------------------------------------
# (pola umum; skrip tidak pernah MENCETAK nilai secret, hanya lokasi + jenisnya)
while IFS= read -r line; do
  loc="${line%%:*}"; rest="${line#*:}"; ln="${rest%%:*}"
  report "SECRET" "$loc:$ln" "kemungkinan secret hardcoded — pindah ke environment variable, jangan commit nilainya"
done < <(grep -rEin $EXCLUDES \
  -e 'sk-(proj|live)-[A-Za-z0-9]{10,}' \
  -e 'AKIA[0-9A-Z]{16}' \
  -e 'ghp_[A-Za-z0-9]{20,}' \
  -e 'xox[bap]-[A-Za-z0-9-]+' \
  -e 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY' \
  -e '(password|passwd|pwd)\s*[:=]\s*["'\''][^"'"'"']+["'\'']' \
  -e '(api[_-]?key|apikey)\s*[:=]\s*["'\''][^"'"'"']{4,}["'\'']' \
  -e '(jwt_?secret|secret_?key|encryption_?key)\s*[:=]\s*["'\''][^"'"'"']+["'\'']' \
  -e '(database_?url|db_?url)\s*[:=]\s*["'\''][^"'"'"']*:[^"'"'"']*@[^"'"'"']+["'\'']' \
  "$TARGET" 2>/dev/null || true)

# 2. SELECT * ----------------------------------------------------------------
while IFS= read -r line; do
  loc="${line%%:*}"; rest="${line#*:}"; ln="${rest%%:*}"
  report "SELECT-STAR" "$loc:$ln" "SELECT * di kode produksi — sebutkan kolom yang dibutuhkan secara eksplisit"
done < <(grep -rEin $EXCLUDES --include='*.js' --include='*.ts' --include='*.py' --include='*.php' --include='*.java' \
  -e 'select\s+\*' "$TARGET" 2>/dev/null | grep -viE 'select\s+\*\s+from\s+(information_schema|pg_)' || true)

# 3. Query SQL dengan interpolasi string --------------------------------------
while IFS= read -r line; do
  loc="${line%%:*}"; rest="${line#*:}"; ln="${rest%%:*}"
  report "SQL-INJECTION" "$loc:$ln" "kemungkinan SQL disusun via interpolasi string — pakai query parameterized / ORM"
done < <(grep -rEn $EXCLUDES --include='*.js' --include='*.ts' -e '\$\{' "$TARGET" 2>/dev/null \
  | grep -iE 'select|insert|update|delete|query\(|execute\(' || true)
while IFS= read -r line; do
  loc="${line%%:*}"; rest="${line#*:}"; ln="${rest%%:*}"
  report "SQL-INJECTION" "$loc:$ln" "kemungkinan SQL via f-string/format — pakai query parameterized / ORM"
done < <(grep -rEn $EXCLUDES --include='*.py' -e 'f["'\''].*(SELECT|INSERT|UPDATE|DELETE)' "$TARGET" 2>/dev/null || true)

# 4. Token di localStorage ----------------------------------------------------
while IFS= read -r line; do
  loc="${line%%:*}"; rest="${line#*:}"; ln="${rest%%:*}"
  report "TOKEN-STORAGE" "$loc:$ln" "token sensitif di localStorage (rentan XSS) — pakai cookie httpOnly; Secure; SameSite"
done < <(grep -rEn $EXCLUDES --include='*.js' --include='*.ts' -e 'localStorage' "$TARGET" 2>/dev/null \
  | grep -iE 'token|jwt|refresh|auth' || true)

# 5. TIMESTAMP naive di SQL ---------------------------------------------------
while IFS= read -r line; do
  loc="${line%%:*}"; rest="${line#*:}"; ln="${rest%%:*}"
  report "NAIVE-TIMESTAMP" "$loc:$ln" "TIMESTAMP tanpa TZ — pakai TIMESTAMPTZ agar zona waktu konsisten"
done < <(grep -rEin $EXCLUDES --include='*.sql' -e 'TIMESTAMP([^T]|$)' "$TARGET" 2>/dev/null || true)

echo "---"
echo "Dipindai: $TARGET | Temuan: $COUNT"
exit "$COUNT"
