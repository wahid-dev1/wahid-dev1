import json
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / "portfolio_config.json"


def load_config():
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def project_line(p):
    link = f"[{p['name']}]({p['url']})" if p.get("url") else p["name"]
    badge = " 🛠️ Open Source" if "OmniLedger" in p["name"] else ""
    return f"| {link}{badge} | {p['desc']} | `{p['tech']}` |"


def generate(cfg):
    metrics = " · ".join(f"**{m['value']}** {m['label']}" for m in cfg["metrics"])
    competencies = " · ".join(f"`{c}`" for c in cfg["competencies"])

    experience_blocks = []
    for job in cfg["experience"]:
        bullets = "\n".join(f"  - {h}" for h in job["highlights"])
        experience_blocks.append(
            f"### {job['role']} · {job['company']}\n"
            f"*{job['location']} · {job['period']}*\n\n"
            f"{bullets}"
        )

    skills_lines = []
    for category, items in cfg["skills"].items():
        skills_lines.append(f"**{category}:** {', '.join(f'`{i}`' for i in items)}")

    project_rows = "\n".join(project_line(p) for p in cfg["projects"])

    return f"""# Hi, I'm {cfg['name']} 👋

### {cfg['title']}
*{cfg['tagline']}*

📍 {cfg['location']} · 🌍 {cfg['relocation']}

[![Portfolio](https://img.shields.io/badge/Portfolio-Live-1d4ed8?style=for-the-badge)]({cfg['portfolio_url']})
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge)]({cfg['linkedin']})
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge)](mailto:{cfg['email']})

---

## About Me

{cfg['summary']}

{metrics}

---

## Core Competencies

{competencies}

---

## Professional Experience

{chr(10).join(experience_blocks)}

---

## Technical Skills

{chr(10).join(skills_lines)}

---

## Featured Projects

| Project | Description | Stack |
|--------|-------------|-------|
{project_rows}

---

## Education

**{cfg['education']['degree']}**  
{cfg['education']['school']} · Graduated {cfg['education']['graduated']}

---

## Connect

- 🌐 **Portfolio:** [{cfg['portfolio_url']}]({cfg['portfolio_url']})
- 💼 **LinkedIn:** [{cfg['linkedin']}]({cfg['linkedin']})
- 📧 **Email:** [{cfg['email']}](mailto:{cfg['email']})
- 📱 **Phone:** {cfg['phone']}
- 💻 **GitHub:** [@wahid-dev1]({cfg['github']})

---

<sub>Profile README synced from <code>portfolio_config.json</code> · <a href="{cfg['portfolio_url']}">View full portfolio site</a></sub>
"""


if __name__ == "__main__":
    config = load_config()
    readme = generate(config)
    readme_path = Path(__file__).parent / "README.md"
    readme_path.write_text(readme, encoding="utf-8")
    print(f"Wrote {readme_path}")
