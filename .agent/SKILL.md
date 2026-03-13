---
name: MultiCountryCMS
description: Architect and developer for a modular, scalable multi-country CMS system.
---

# Multi-Country CMS Skill

This skill provides the intelligence and patterns needed to build and expand the Multi-Country CMS.

## Core Principles
1. **Country-First Architecture**: Every piece of content belongs to a country.
2. **Modular Modules**: Each module (Blogs, News, Jobs) should be self-contained in its folder structure but follow shared patterns.
3. **Rich Aesthetics**: Follow the "Rich Aesthetics" guidelines (vibrant colors, glassmorphism, smooth animations).
4. **Clean API**: RESTful endpoints with consistent error handling and pagination.

## Directory Structure
- `backend/`: Node/Express system.
- `frontend/`: React/Vite system.
- `.agent/workflows/`: Automated scripts for common tasks.

## Content Models
All content models MUST have:
- `countryId`: ObjectId ref to 'Country'
- `status`: enum ['draft', 'published']
- `seo`: { metaTitle, metaDescription }

## Automated Workflows
- `/generate-module`: Create a new CMS module (Model, Controller, Route, Frontend Page).
- `/add-country`: Add a new country to the system.
