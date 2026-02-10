# Memory: integration/alibaba/image-model-availability-confirmed
Updated: 2026-02-10

## Image Generation & Editing Models — Confirmed from Official Docs

### Image Generation

| Model | Singapore | Beijing | Call Type | Resolution |
|-------|:---------:|:-------:|-----------|------------|
| `qwen-image-max` | ✅ | ✅ | Sync | 5 fixed (16:9, 9:16, 1:1, 4:3, 3:4) |
| `qwen-image-plus` | ✅ | ✅ | Sync + Async | 5 fixed |
| `qwen-image` | ✅ | ✅ | Sync + Async | 5 fixed |
| `wan2.6-t2i` | ✅ | ✅ | **Async only** | Variable |
| `wan2.5-t2i-preview` | ✅ | ✅ | **Async only** | Variable |
| `wan2.2-t2i-flash` | ✅ | ✅ | **Async only** | Custom 512–1440px |

### Qwen-Image Fixed Resolutions
- 1664×928 (16:9)
- 928×1664 (9:16)
- 1328×1328 (1:1)
- 1472×1104 (4:3)
- 1104×1472 (3:4)

### Image Editing

| Model | Singapore | Beijing | Inputs → Outputs |
|-------|:---------:|:-------:|-----------------|
| `qwen-image-edit-max` | ✅ | ✅ | 1–3 → 1–6 |
| `qwen-image-edit-plus` | ✅ | ✅ | 1–3 → 1–6 |
| `qwen-image-edit` | ✅ | ✅ | 1–3 → 1 |
| `wanx2.1-imageedit` | ❌ | ✅ | 1 → 1 ($0.020070/img) |
| `wan2.5` (editing) | ✅ | ✅ | 1–3 → 1–4 |

### Model Selection Guide
- **Complex text rendering** (posters, signs, couplets): `qwen-image-max` or `wan2.6-t2i`
- **Realistic photography**: `wan2.6-t2i` or `wan2.5-t2i-preview`
- **Custom resolution**: `wan2.2-t2i-flash` (512–1440px any combo)
- **Text modification in images**: `qwen-image-edit-max`
- **Multi-image fusion**: `wan2.5` editing or `qwen-image-edit-max`
- **Inpainting/watermark removal**: `wanx2.1-imageedit` (Beijing only)

### Key Implementation Notes
- Qwen-Image: Sync calls (instant response), REST API
- Wan models: **Async only** — submit task, poll for result
- Generated image URLs expire after **24 hours**
- `wanx2.1-imageedit` requires `ALIBABA_CHINA_API_KEY` (Beijing only, no free quota)
- Batch Operations must be enabled for async Wan models
- Reference: https://bailian.console.alibabacloud.com/cn-beijing?tab=doc#/doc/?type=model&url=2873061
