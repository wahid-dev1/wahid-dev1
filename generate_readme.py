import json

# Simple portfolio generator

def generate():
    return f"""# Wahid Ur Rehman
**Full Stack Engineer | AI Systems | Scalable Backend Architecture**

## Auto-Generated Portfolio

- Builds scalable backend systems
- Works with AI/LLM pipelines
- Production-grade APIs and architecture

## Highlights
- Reduced API latency by 35%
- Scaled systems to 50k+ users
- Improved throughput by 3x

---
Generated automatically via pipeline
"""

if __name__ == "__main__":
    with open("README.md", "w") as f:
        f.write(generate())
