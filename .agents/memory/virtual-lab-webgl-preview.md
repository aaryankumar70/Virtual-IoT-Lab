---
name: Virtual Lab WebGL preview
description: Environment-specific behavior when validating the React Three Fiber electronics workspace.
---

The managed screenshot/browser runner can report no usable WebGL context even when the application code and Three.js scene are valid. The lab should retain the real React Three Fiber canvas for capable browsers and render a clear unavailable state when WebGL cannot be created; do not substitute a CSS/SVG fake 3D view.

**Why:** A renderer creation failure previously surfaced as a full Vite runtime-error overlay, which obscured the rest of the lab and made preview verification misleading.

**How to apply:** When validating 3D changes, use typecheck/build plus a browser screenshot. Treat a clean capability message in a no-WebGL runner as expected; investigate actual renderer errors separately.