# Lotus Ark L2.2 · Coupled Petals and Solar Membrane

Personal BlenderPilot P2-L research prototype. Source Blender scenes and QA receipts are in the local `outputs/p2l/` directory.

This static Three.js page:
- Shares the verified P2-K petal transformation for 8 / 10 / 12 petals and Fold 0–100%.
- Adds independent Deployment 0–100% of two membrane-sail rigs, with 3D pivot/scale matched to native Blender 5.3 drivers.
- Provides combined Loop, scale-reference visibility and multiple camera views.
- Loads separate sail GLBs flattened into Blender world coordinates to avoid wrong parent-transform export offsets.
- Preserves the prior [L2.1 motion](../motion/) and [L2 static viewer](../).

Verified project-level gates (2026-11-18 Asia/Shanghai): 63 sampled native fold/deployment combinations zero *non-hull* surface contacts; sail driver 5-value numerical parity maximum difference ~1.01e-6 m; exported GLB bounding boxes within 2.39e-7 m of Blender. These are **not** swept collision, self-collision, stiffness or manufacturability certifications.

Original user workspace at `D:\CodexData\BlenderPilot`. This folder only contains published read-only GLBs/JS/HTML and no credentials.
