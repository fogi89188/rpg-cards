// Auto Bold Rules Configuration
// Add or modify rules here - each rule is an object with pattern, replacement, and description

var autoBoldRules = [
    
    {
        pattern: /^description\s*\|\s*Using a (Higher-(?:Level )?Spell Slot)\s*:\s*\|\s*/gi,
        replacement: 'text |',
    },
    {
        pattern: /^section\s*\|\s*At higher levels\s*$/gmi,
        replacement: 'fill |',
    },
    {
        pattern: /^description\s*\|\s*Cantrip Upgrade\s*:\s*$/gmi,
        replacement: 'text |',
    },

    {
        pattern: /(\d+)\s*-?f(ee|oo)?t/gi,
        replacement: '<b>$1ft</b>',
    },

    // Bold dice notation (e.g., 1d6, 2d8+3, 4d10-2) - Updated for better matching
    {
        pattern: /(\d+d\d+(?:[+\-]\d+)?)/gi,
        replacement: '<b>$1</b>',
    },

    // Bold standalone numbers (but not those already caught by other rules)
    {
        pattern: /\b(\d+)\b/g,
        replacement: '<b>$1</b>',
    },

    {
        pattern: /\b(worn)?\s*(or)?\s*(carr(y|ied))/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold damage types
    {
        pattern: /\b(fire|cold|lightning|thunder|acid|poison|necrotic|radiant|psychic|force|piercing|slashing|bludgeoning)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Bold damage
    {
        pattern: /\b(double|half|damage)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Bold "Action"
    {
        pattern: /\b(Action)\b/gi,
        replacement: '$1',
    },

    // Actions (excluding standalone Action after pipe)
    {
        pattern: /\b((bonus|free)?\s+actions?|reactions?|interactions?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Advantages and Disadvantages
    {
        pattern: /\b((dis)?advantages?|critical\s*(hits?)?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Attack types
    {
        pattern: /\b(melee|ranged|weapons?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Attacks
    {
        pattern: /(attacks?)/gi,
        replacement: '<b>$1</b>',
    },

    {
        pattern: /(rolls?)/gi,
        replacement: '<b>$1</b>',
    },

    // AC and HP
    {
        pattern: /\b(AC|Armor Class|HP|hit\s*points?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Speed and movement
    {
        pattern: /\b((movement|flying|swimming|climbing)\s*(speed)?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Area shapes
    {
        pattern: /\b(cone|sphere|cylinder|cube|line|radius|diameter)\b/gi,
        replacement: '<b>$1</b>',
    },

    {
        pattern: /\b(starts?|begin(?:ning|s)?|ends?)\b/gi,
        replacement: '<b>$1</b>',
    },

    {
        pattern: /\bof\s+(yours?|its?|the|their)/gi,
        replacement: '<b>$1</b>',
    },

    // Targeting and entities
    {
        pattern: /\b(creatures?|targets?|person|people|entit(y|ies)?|ally|allies|enemy|enemies|opponents?|characters?|players?|NPCs?)/gi,
        replacement: '<b>$1</b>',
    },

    // Time measurements
    {
        pattern: /\b((next)?\s*(rounds?|minutes?|hours?|days?|turns?))\b/gi,
        replacement: '<b>$1</b>',
    },

    // Targeting modifiers and actions
    {
        pattern: /\b(choose|each|every|within|range|regains?|saves?|loses?)\b/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold ability scores and saving throws - Updated pattern
    {
        pattern: /\b(S?s?trength|D?d?exterity|C?c?onstitution|I?i?ntelligence|W?w?isdom|C?c?harisma|STR|DEX|CON|INT|WIS|CHA)\b/g,
        replacement: '<b>$1</b>',
    },
    
    // Bold successful / failed
    {
        pattern: /\b(success(ful)?|fail(ed)?|succeed)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Bold checks and saving throws
    {
        pattern: /\b(checks?|saving throws?)\b/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold conditions (e.g., charmed, frightened, paralyzed)
    {
        pattern: /\b(blind(ed)?|charm(ed)?|deaf(ened)?|frightened|(grapple)d?|incapacitated?|invisible|paralyzed?|petrif(y|ied)?|poison(ed)?|prone|restrain(ed)?|stun(ned)?|unconscious|exhaust(ed|ion)?)\b/gi,
        replacement: '<b>$1</b>',
    },
    
    {
        pattern: /\b(\d+(st|nd|rd|th)?\s+levels?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Spell Stuff
    {
        pattern: /\b(cantrips?|rituals?|concentration|spell\s+(slots?)?\s+(levels?))\b/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold property names (like "Casting time", "Range", "Components")
    {
        pattern: /^property\s*\|\s*([^|:]+):?\s*/gm,
        replacement: 'property | <b>$1:</b> ',
    },

    // Bold property names (like "Casting time", "Range", "Components")
    {
        pattern: /^description\s*\|\s*([^|:]+):?\s*/gm,
        replacement: 'description | <b>$1:</b> ',
    },
    
    // To add a new rule, add a comma after the closing brace above and add your new rule:
    /*
    ,{
        pattern: /your-regex-here/g,
        replacement: '<b>$1</b>',
    }
    */
];