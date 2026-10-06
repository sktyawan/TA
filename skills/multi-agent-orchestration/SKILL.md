---
name: multi-agent-orchestration
description: >-
  Orchestrate and coordinate complex multi-agent workflows, inter-agent communication, parallel execution, task delegation, consensus protocols, and dynamic mesh routing across AI agents.
---

# Multi-Agent Orchestration Skill

The **Multi-Agent Orchestration Skill** provides patterns, protocol specifications, and execution engines for coordinating multiple specialized AI agents (e.g., HR, Upwork, Personal Branding, Excel, Instagram, YouTube, TikTok, Facebook, Full-Stack, and 3D Design).

## 1. Core Principles

- **Task Decomposition & Delegation**: Break complex goals into smaller subtasks assigned to agents according to their specialized skill definitions.
- **Inter-Agent Communication Mesh**: Event-driven message routing allowing agents to exchange structured data, logs, and proposals.
- **Consensus & Peer Review Protocol**: Dual-agent audit and verification before finalizing cross-domain tasks.
- **Dynamic Load Balancing & Model Routing**: Route task execution to primary or fallback LLMs using 9Router API Gateway rules.

## 2. Agent Roster & Domain Mapping

1. **Sari (`hr-admin`)**: Employee NIK/BPJS compliance, HR audit & PKWT tracking.
2. **Dinda (`upwork-freelance`)**: Gig discovery, proposal scoring & hourly rate pricing.
3. **Rina (`personal-branding`)**: GitHub, LinkedIn & X cross-platform positioning.
4. **Siti (`excel-mastery`)**: Formula debugging, structured tables & XLOOKUP audits.
5. **Citra (`instagram-creator`)**: 0-3s Reels hooks, 7-slide Carousels & hashtag curation.
6. **Maya (`youtube-creator`)**: Video scripts, SEO titles, thumbnails & Shorts repurposing.
7. **Zahra (`tiktok-creator`)**: FYP trends, rising audio selection & 3-variant hook testing.
8. **Dewi (`facebook-creator`)**: Community long-form storytelling & Facebook Group engagement.
9. **Dira (`fullstack-dev`)**: Express REST API endpoints, PostgreSQL schemas & UI/UX integration.
10. **Fitri (`desain-3d`)**: 3D product renders, lighting compositions & Design Token system.

## 3. Communication Mesh Protocol

Inter-agent messages follow the standard JSON packet format:

```json
{
  "from": "Dira",
  "to": "Fitri",
  "text": "Koordinasi parameter data operasional dan sinkronisasi log skill.",
  "ts": "2026-10-06T02:50:00.000Z",
  "metadata": {
    "priority": "high",
    "workflow": "design-token-sync"
  }
}
```

## 4. Orchestration Workflows

### Workflow A: Content Repurposing Engine
- **Trigger**: Maya (`youtube-creator`) generates a long-form video script.
- **Delegation**:
  1. Citra (`instagram-creator`) extracts 7-slide Carousel slides.
  2. Zahra (`tiktok-creator`) creates a 35s FYP video script with rising audio.
  3. Dewi (`facebook-creator`) transforms the core lesson into a community long-form story.
  4. Rina (`personal-branding`) publishes a key takeaways breakdown on LinkedIn & X.

### Workflow B: Feature Build & Deployment Loop
- **Trigger**: Dira (`fullstack-dev`) proposes a new API module.
- **Delegation**:
  1. Fitri (`desain-3d`) supplies updated UI design tokens and component specs.
  2. Siti (`excel-mastery`) validates input dataset schemas and audit logs.
  3. Sari (`hr-admin`) checks compliance and role permissions.

## 5. Implementation Status

This skill is natively integrated into the **HERMES Control Center Dashboard**, enabling live inter-agent debate simulation, webhook dispatches, and real-time telemetry monitoring.
