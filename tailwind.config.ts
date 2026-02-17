import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			// Industry differentiation tokens
    			industry: {
    				healthcare: 'hsl(var(--industry-healthcare))',
    				finance: 'hsl(var(--industry-finance))',
    				education: 'hsl(var(--industry-education))',
    				retail: 'hsl(var(--industry-retail))',
    				realestate: 'hsl(var(--industry-realestate))',
    				hospitality: 'hsl(var(--industry-hospitality))',
    				automotive: 'hsl(var(--industry-automotive))',
    				media: 'hsl(var(--industry-media))',
    				legal: 'hsl(var(--industry-legal))',
    				government: 'hsl(var(--industry-government))',
    				nonprofit: 'hsl(var(--industry-nonprofit))',
    				technology: 'hsl(var(--industry-technology))',
    				pharma: 'hsl(var(--industry-pharma))',
    				energy: 'hsl(var(--industry-energy))',
    				telecom: 'hsl(var(--industry-telecom))',
    				sports: 'hsl(var(--industry-sports))',
    				food: 'hsl(var(--industry-food))',
    				construction: 'hsl(var(--industry-construction))',
    				logistics: 'hsl(var(--industry-logistics))',
    				insurance: 'hsl(var(--industry-insurance))',
    				agriculture: 'hsl(var(--industry-agriculture))',
    			},
    			// Status semantic tokens
    			status: {
    				success: 'hsl(var(--status-success))',
    				warning: 'hsl(var(--status-warning))',
    				error: 'hsl(var(--status-error))',
    				info: 'hsl(var(--status-info))',
    				pending: 'hsl(var(--status-pending))',
    			},
    			// AI Provider brand tokens
    			provider: {
    				alibaba: 'hsl(var(--provider-alibaba))',
    				azure: 'hsl(var(--provider-azure))',
    				elevenlabs: 'hsl(var(--provider-elevenlabs))',
    				openai: 'hsl(var(--provider-openai))',
    				claude: 'hsl(var(--provider-claude))',
    				deepseek: 'hsl(var(--provider-deepseek))',
    				gemini: 'hsl(var(--provider-gemini))',
    				meshy: 'hsl(var(--provider-meshy))',
    				modelslab: 'hsl(var(--provider-modelslab))',
    				deepl: 'hsl(var(--provider-deepl))',
    				replicate: 'hsl(var(--provider-replicate))',
    				gcp: 'hsl(var(--provider-gcp))',
    				deepgram: 'hsl(var(--provider-deepgram))',
    			},
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		},
    		fontFamily: {
    			sans: [
    				'Space Grotesk',
    				'ui-sans-serif',
    				'system-ui',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI',
    				'Roboto',
    				'Helvetica Neue',
    				'Arial',
    				'Noto Sans',
    				'sans-serif'
    			],
    			serif: [
    				'Lora',
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			],
    			mono: [
    				'Space Mono',
    				'ui-monospace',
    				'SFMono-Regular',
    				'Menlo',
    				'Monaco',
    				'Consolas',
    				'Liberation Mono',
    				'Courier New',
    				'monospace'
    			]
    		},
    		boxShadow: {
    			'2xs': 'var(--shadow-2xs)',
    			xs: 'var(--shadow-xs)',
    			sm: 'var(--shadow-sm)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)',
    			xl: 'var(--shadow-xl)',
    			'2xl': 'var(--shadow-2xl)'
    		}
    	}
    },
	plugins: [tailwindcssAnimate],
} satisfies Config;
