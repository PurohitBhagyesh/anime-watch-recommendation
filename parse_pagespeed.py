import json

with open("pagespeed_mobile.json") as f:
    data = json.load(f)

print(f"URL: {data.get('id')}")
metrics = data.get("lighthouseResult", {}).get("categories", {})
for cat, details in metrics.items():
    print(f"Category: {cat}, Score: {details.get('score', 0) * 100}")

print("\n--- Audits with issues ---")
audits = data.get("lighthouseResult", {}).get("audits", {})
for key, audit in audits.items():
    if audit.get("score") is not None and audit.get("score") < 0.9 and audit.get("scoreDisplayMode") not in ["notApplicable", "informative", "manual"]:
        print(f"\nAudit: {audit.get('title')} ({key})")
        print(f"Description: {audit.get('description')}")
        if "displayValue" in audit:
            print(f"Value: {audit.get('displayValue')}")
        
        details = audit.get("details", {})
        if details.get("type") == "opportunity":
            for item in details.get("items", []):
                print(f"  - {item.get('url', '')} (Waste: {item.get('wastedBytes', 0)/1024:.1f} KB / {item.get('wastedMs', 0)} ms)")
