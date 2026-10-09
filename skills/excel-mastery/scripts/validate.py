#!/usr/bin/env python3
"""validate.py — pemindai pola formula Excel yang umum salah (skill excel-mastery).

Pakai:
    python3 validate.py workbook.xlsx [--sheet NAMA]
    python3 validate.py --text daftar-formula.txt   # satu formula per baris, tanpa openpyxl

Pola yang diperiksa (dari anti-pattern SKILL.md excel-mastery):
 1. VLOOKUP tanpa argumen ke-4 / dengan TRUE  -> pencocokan kira-kira berbahaya
 2. XLOOKUP search_mode 2/-2 (binary search)  -> wajib data terurut sesuai arahnya
 3. XLOOKUP 5 argumen dengan argumen ke-5 = -1 -> kemungkinan maksud "cari dari bawah"
    (itu search_mode = argumen ke-6), bukan match_mode
 4. Range penuh kolom (A:A, C:C) di SUMIFS/COUNTIFS/XLOOKUP/AVERAGEIFS -> lambat
 5. INDIRECT( / OFFSET( -> fungsi volatil, dihitung ulang setiap perubahan
 6. IF bersarang lebih dari 2 level -> pakai IFS
 7. SUMIFS/COUNTIFS/AVERAGEIFS dengan range tidak sejajar (jumlah baris beda)
 8. Kriteria tanggal sebagai teks (">=01/01/2026") -> pakai DATE()

Butuh openpyxl untuk membaca .xlsx. Jika openpyxl tidak tersedia, skrip tetap
jalan dalam mode teks (--text) dan mencetak pesan yang jelas.
Keluar: daftar temuan "lokasi: masalah". Exit code = jumlah temuan (0 = bersih).
"""

import argparse
import re
import sys

try:
    import openpyxl
    HAVE_OPENPYXL = True
except ImportError:
    HAVE_OPENPYXL = False


# ---------------------------------------------------------------- util
def split_args(inner):
    """Pecah argumen fungsi level-teratas; separator koma ATAU titik-koma."""
    args, depth, cur, instr = [], 0, [], False
    q = ""
    for ch in inner:
        if instr:
            cur.append(ch)
            if ch == q:
                instr = False
            continue
        if ch in ("'", '"'):
            instr, q = True, ch
            cur.append(ch)
        elif ch == "(":
            depth += 1
            cur.append(ch)
        elif ch == ")":
            depth -= 1
            cur.append(ch)
        elif ch in (",", ";") and depth == 0:
            args.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
    if cur or not args:
        args.append("".join(cur).strip())
    return args


def func_calls(formula):
    """Daftar (nama_fungsi, isi_dalam_kurung) untuk semua pemanggilan fungsi."""
    out = []
    up = formula.upper()
    for m in re.finditer(r"([A-Z][A-Z0-9\.]*)\s*\(", up):
        name = m.group(1)
        i = m.end()
        depth = 1
        instr = False
        q = ""
        start = i
        while i < len(up) and depth > 0:
            ch = up[i]
            if instr:
                if ch == q:
                    instr = False
            elif ch in ("'", '"'):
                instr, q = True, ch
            elif ch == "(":
                depth += 1
            elif ch == ")":
                depth -= 1
            i += 1
        inner_orig = formula[start:i - 1]
        out.append((name, inner_orig))
    return out


def range_row_count(rng):
    """Kembalikan (baris_awal, baris_akhir) dari range A1-style, atau None."""
    m = re.search(r"\$?[A-Z]{1,3}\$?(\d+)\s*:\s*\$?[A-Z]{1,3}\$?(\d+)", rng)
    if not m:
        return None
    return int(m.group(1)), int(m.group(2))


RANGE_RE = re.compile(r"(?:[A-Za-z0-9_\.\']+!)?\$?[A-Z]{1,3}\$?\d+:\$?[A-Z]{1,3}\$?\d+")


# ---------------------------------------------------------------- checks
def check_formula(formula):
    """Kembalikan list string masalah untuk satu formula."""
    issues = []
    up = formula.upper()
    calls = func_calls(formula)

    for name, inner in calls:
        args = split_args(inner)

        # 1. VLOOKUP tanpa argumen ke-4 / TRUE
        if name == "VLOOKUP":
            if len(args) < 4:
                issues.append(
                    "VLOOKUP tanpa argumen ke-4 (range_lookup) -> pakai pencocokan "
                    "kira-kira yang bisa salah diam-diam; tambah FALSE atau ganti XLOOKUP"
                )
            elif args[3].strip().upper() in ("TRUE", "1"):
                issues.append(
                    "VLOOKUP dengan range_lookup=TRUE -> pencocokan kira-kira; "
                    "pakai FALSE untuk cocok persis"
                )

        # 2 & 3. XLOOKUP match_mode/search_mode
        if name == "XLOOKUP":
            if len(args) >= 6:
                sm = args[5].strip()
                if sm in ("2", "-2"):
                    issues.append(
                        "XLOOKUP search_mode=%s (binary search) -> WAJIB data terurut "
                        "sesuai arahnya; di data acak hasilnya ngawur tanpa peringatan" % sm
                    )
            elif len(args) == 5 and args[4].strip() == "-1":
                issues.append(
                    "XLOOKUP dengan match_mode=-1 -> pastikan maksudnya 'cocok persis "
                    "atau nilai lebih kecil' (bukan 'cari dari bawah'; itu search_mode "
                    "= argumen ke-6)"
                )

    # 4. Range penuh kolom di fungsi agregat/lookup
    if re.search(r"\b(SUMIFS|COUNTIFS|AVERAGEIFS|XLOOKUP|SUMPRODUCT)\s*\(", up):
        for m in re.finditer(r"\$?[A-Z]{1,3}:\$?[A-Z]{1,3}(?![A-Z0-9])", formula):
            # pastikan bukan bagian dari range A1 (mis. A2:A100)
            s = m.group(0)
            issues.append(
                "range penuh kolom %s -> Excel memindai 1 juta+ baris; "
                "ganti dengan tabel terstruktur (Ctrl+T)" % s
            )
            break  # cukup satu per formula agar tidak berisik

    # 5. Fungsi volatil
    if re.search(r"\b(INDIRECT|OFFSET)\s*\(", up):
        issues.append(
            "fungsi volatil INDIRECT/OFFSET -> dihitung ulang setiap ada perubahan; "
            "ganti dengan tabel terstruktur/INDEX/CHOOSE"
        )

    # 6. IF bersarang > 2 level
    if_count = len(re.findall(r"\bIF\s*\(", up))
    if if_count > 2:
        issues.append(
            "IF bersarang %d level -> wajib pakai IFS atau tabel referensi + XLOOKUP" % if_count
        )

    # 7. Range tidak sejajar di SUMIFS/COUNTIFS/AVERAGEIFS
    for name, inner in calls:
        if name in ("SUMIFS", "COUNTIFS", "AVERAGEIFS"):
            counts = set()
            for rm in RANGE_RE.finditer(inner):
                rc = range_row_count(rm.group(0))
                if rc:
                    counts.add(rc[1] - rc[0] + 1)
            if len(counts) > 1:
                issues.append(
                    "%s dengan range tidak sejajar (jumlah baris: %s) -> hasil #VALUE! "
                    "atau salah; samakan semua range" % (name, sorted(counts))
                )

    # 8. Kriteria tanggal sebagai teks
    if re.search(r'"[<>]=?\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}"', formula):
        issues.append(
            'kriteria tanggal sebagai teks (mis. ">=01/01/2026") -> bergantung format '
            "tanggal sistem dan bisa 0 diam-diam; pakai \">=\"&DATE(tahun;bulan;hari)"
        )

    return issues


# ---------------------------------------------------------------- main
def scan_workbook(path, sheet_name=None):
    findings = []
    wb = openpyxl.load_workbook(path, data_only=False, read_only=True)
    sheets = [wb[sheet_name]] if sheet_name else wb.worksheets
    for ws in sheets:
        for row in ws.iter_rows():
            for cell in row:
                if cell.data_type == "f" and cell.value:
                    formula = str(cell.value)
                    if not formula.startswith("="):
                        formula = "=" + formula
                    for issue in check_formula(formula):
                        findings.append((f"{ws.title}!{cell.coordinate}", formula, issue))
    return findings


def scan_text(path):
    findings = []
    with open(path, encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if ":" in line and line.split(":", 1)[1].strip().startswith("="):
                loc, formula = line.split(":", 1)
                loc, formula = loc.strip(), formula.strip()
            else:
                loc, formula = f"baris-{i}", line
            if not formula.startswith("="):
                formula = "=" + formula
            for issue in check_formula(formula):
                findings.append((loc, formula, issue))
    return findings


def main():
    ap = argparse.ArgumentParser(description="Pemindai pola formula Excel yang umum salah.")
    ap.add_argument("workbook", nargs="?", help="file .xlsx yang dipindai")
    ap.add_argument("--sheet", help="hanya pindai sheet ini")
    ap.add_argument("--text", help="mode teks: file berisi satu formula per baris")
    args = ap.parse_args()

    if args.text:
        findings = scan_text(args.text)
        src = args.text
    elif args.workbook:
        if not HAVE_OPENPYXL:
            print(
                "PESAN: openpyxl tidak tersedia di Python ini, jadi file .xlsx tidak bisa dibaca.\n"
                "Opsi: (1) pasang dengan `pip install openpyxl`, lalu jalankan lagi; atau\n"
                "     (2) pakai mode teks: tulis formula satu per baris ke file .txt lalu jalankan\n"
                "         `python3 validate.py --text formulas.txt` (mode ini tidak butuh openpyxl).",
                file=sys.stderr,
            )
            return 2
        findings = scan_workbook(args.workbook, args.sheet)
        src = args.workbook
    else:
        ap.print_help()
        return 2

    for loc, formula, issue in findings:
        print(f"{loc}: {issue}\n    {formula}")
    print(f"\n---\nDipindai: {src} | Temuan: {len(findings)}")
    return min(len(findings), 255)


if __name__ == "__main__":
    sys.exit(main())
