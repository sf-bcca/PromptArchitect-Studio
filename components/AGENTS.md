# COMPONENTS KNOWLEDGE BASE

## OVERVIEW
High-fidelity React 19 components for prompt engineering, model selection, and user authentication.

## STRUCTURE
```
components/
├── Auth.tsx              # Supabase Auth forms (Login/Sign-up)
├── FavoriteButton.tsx    # Toggle for bookmarking prompts
├── FavoritesSection.tsx  # Display area for saved favorites
├── Header.tsx            # Navigation and branding
├── HistorySidebar.tsx    # User's prompt history drawer
├── ModelSelector.tsx     # Dropdown for Gemini/Ollama selection
├── PromptCard.tsx        # Individual engineered prompt result view
├── PromptForm.tsx        # Core input area with transform logic
└── ResultDisplay.tsx     # Container for prompt results and loading states
```

## WHERE TO LOOK
| Pattern | File(s) | Notes |
|---------|---------|-------|
| Form Handling | `PromptForm.tsx`, `Auth.tsx` | Standard controlled components |
| Result Mapping | `ResultDisplay.tsx` | Maps `RefinedPromptResult` to UI |
| Sidebar Layout | `HistorySidebar.tsx` | Mobile-responsive drawer pattern |
| Theme Support | All | Heavy use of `dark:` Tailwind variants |
| API Integration | `Auth.tsx`, `PromptForm.tsx` | Direct service calls to Supabase |

## CONVENTIONS
- **Functional Components**: Use `React.FC<Props>` for all UI components.
- **Tailwind-First**: Styling is managed via Tailwind CSS classes for premium "glassmorphism" aesthetics.
- **Strict Typing**: All props must be defined in local interfaces (e.g., `interface PromptFormProps`).
- **Conditional Rendering**: Use early returns for error/loading states (see `ResultDisplay.tsx`).
- **Aria Labels**: Mandatory `aria-label` for all inputs and interactive elements.

## ANTI-PATTERNS
- **NEVER** use inline `style={{}}` attributes; use Tailwind classes or global CSS.
- **NEVER** handle raw API secrets in component files; use `services/`.
- **DO NOT** use `any` for props; use `RefinedPromptResult` or specific types from `@/types`.
- **DO NOT** duplicate complex SVG icons; abstract them or use a consistent library.
- **AVOID** prop drilling; use Context (in `context/`) for global session state.

## TESTING
- **Vitest**: Unit tests reside alongside components (e.g., `Header.test.tsx`).
- **Component Mocking**: Mock Supabase client when testing authenticated components.
