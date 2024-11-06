---
layout: default
title: Prompt Generation Guide
---

# AI Prompt Generation Guide

## Input Fields

### Base Description
The core description of what you want to generate. This is processed by our Prometheus Prompt Engine for optimization.

### Mode Selection
- Image Generation

Image prompts have a 300 token maximum length.

### Enhancement Options

#### Genre Selection
Choose from categories including:
- Fantasy (High Fantasy, Urban Fantasy, Dark Fantasy, etc.)
- Sci-Fi (Space Opera, Cyberpunk, Post-Apocalyptic, etc.)
- Horror (Gothic, Cosmic Horror, Psychological Horror, etc.)

#### Style Presets
Pre-configured style settings optimized for different visual outcomes.

#### Reference Options
- Movie References
- Book References

## Processing Pipeline

1. Local Enhancement
   - Validates input length
   - Checks for required elements
   - Applies basic style rules

2. GPT-4 Enhancement
   - Applies genre-specific improvements
   - Adds technical quality boosters
   - Ensures proper formatting

3. Final Validation
   - Length check
   - Technical elements verification
   - Model-specific optimization

## Example Usage

1. Enter base description
2. Select mode (image)
3. Choose genre and style
4. Add references (optional)
5. Generate optimized prompt
6. Use generated prompt in main interface

For technical details and implementation, see our [API Documentation](../api/generate-prompt).