# Creative Storytelling & Narrative Visual Formats

## Overview
Expanded visual types registry to include 130+ formats with new creative categories for storytelling, mythological narratives, and transformation visualizations.

## New Categories Added

### 1. Storytelling & Mythology (14 formats)
- **Panchatantra Style** - Animal fables teaching business lessons (India)
- **Jataka Tales** - Buddhist birth stories with moral lessons
- **Ramayana/Mahabharata Epic** - Leadership, duty, and strategy narratives
- **Vedantic Philosophy** - Philosophical concepts with symbols
- **Sufi Tales (Rumi)** - Mystical stories with spiritual insights
- **Arabian Nights** - 1001 Nights storytelling format
- **Aesop Fables** - Western moral fables with animals
- **Zen Koan** - Paradoxical stories for insight
- **African Folklore (Anansi)** - Spider tales and wisdom
- **Chinese Legends** - Journey to the West style
- **Nordic Saga** - Viking/Norse mythology
- **Greek Mythology** - Olympian gods and heroes
- **Mayan/Aztec Legends** - Mesoamerican creation stories

### 2. Character Animation (12 formats)
- **Mascot Guide** - Friendly mascot explains concepts
- **Cartoon Teacher** - Animated teacher character
- **Wise Elder/Sage** - Sage shares wisdom
- **Robot/AI Assistant** - Friendly AI for tech
- **Superhero Explainer** - Impact-driven narrative
- **Kid-Friendly Characters** - Young audience format
- **Animal Character Cast** - Team of animals
- **Stick Figure Animation** - Simple explainers
- **Pixar/3D Cartoon** - High-quality 3D characters
- **Anime Style** - Japanese aesthetic
- **Chibi/Cute Style** - Super-deformed cute
- **Flat Design Characters** - Modern illustration

### 3. Transformation Narratives (9 formats)
- **City Transformation Journey** - Development over time
- **Before/After Reveal** - Dramatic transformation
- **Timeline Evolution** - Historical progression
- **Smart City Visualization** - Connected IoT animation
- **Rural to Urban Journey** - Village to megacity
- **Infrastructure Development** - Roads, bridges, rail
- **Green/Sustainable Transition** - Environmental change
- **Digital Adoption Journey** - Analog to digital
- **Industry 4.0 Factory** - Manufacturing automation

### 4. Creative Artistic Styles (13 formats)
- **Watercolor Animation** - Painted aesthetic
- **Oil Painting Style** - Classic art animation
- **Paper Cutout** - Layered craft style
- **Shadow Puppet (Wayang)** - Indonesian style
- **Woodblock Print** - Ukiyo-e aesthetic
- **Mosaic/Tile** - Byzantine/Islamic style
- **Stained Glass** - Cathedral aesthetic
- **Comic Book Panels** - Sequential comics
- **Pop Art** - Warhol/Lichtenstein
- **Street Art/Graffiti** - Urban style
- **Vintage/Retro** - 50s-80s aesthetic
- **Cyberpunk Neon** - Futuristic neon
- **Steampunk Victorian** - Industrial fusion

### 5. Extended Regional Art (12+ formats)
- **Madhubani Art** (India)
- **Warli Tribal Art** (India)
- **Pattachitra Scroll Art** (India)
- **Mughal Miniature** (India)
- **Truck Art** (Pakistan)
- **Nakshi Kantha** (Bangladesh)
- **Chinese Ink Wash**
- **Thai Temple Art**
- **Indonesian Batik**
- **Ndebele Geometric** (South Africa)
- **Inca Textile Patterns** (Peru)

## Implementation Notes
- All formats map to existing generation pipelines (ModelsLab, Alibaba, Gemini)
- Storytelling formats use enhanced AI prompt injection via `ai-universal-processor`
- Character animations leverage HeyGen and Alibaba OmniAvatar
- Transformation narratives use timeline-based scene generation

## Usage Example
```typescript
// Select Panchatantra style for India UPI template
visualTypes: ['story_panchatantra', 'char_animal_cast']
// AI will generate animal fables explaining digital payments
```

Last Updated: 2025-01-29
