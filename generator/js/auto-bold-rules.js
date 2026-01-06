// Auto Bold Rules Configuration
// Add or modify rules here - each rule is an object with pattern, replacement, and description

var autoBoldRules = [
    // Bold numbers followed by "ft" (e.g., 30 ft, 60 ft)
    {
        pattern: /(\d+)\s*-?f(ee)?(oo)?t/gi,
        replacement: '<b>$1 ft</b>',
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
        pattern: /(worn)?\s*(or)?\s*(carr(y|ied))/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold damage types
    {
        pattern: /(fire|cold|lightning|thunder|acid|poison|necrotic|radiant|psychic|force|piercing|slashing|bludgeoning)/gi,
        replacement: '<b>$1</b>',
    },

    // Bold damage
    {
        pattern: /(double|half|damage)/gi,
        replacement: '<b>$1</b>',
    },

    // Actions
    {
        pattern: /((bonus|free)?\s+actions?|reactions?|interactions?)/gi,
        replacement: '<b>$1</b>',
    },

    // Advantages and Disadvantages
    {
        pattern: /((dis)?advantages?|critical\s*(hit)?)/gi,
        replacement: '<b>$1</b>',
    },

    // Attack types
    {
        pattern: /(melee|ranged|spells?|weapons?)/gi,
        replacement: '<b>$1</b>',
    },

    // Attacks
    {
        pattern: /(attacks?)/gi,
        replacement: '<b>$1</b>',
    },

    // AC and HP
    {
        pattern: /\b(AC|Armor Class|HP|hit\s*points?)\b/gi,
        replacement: '<b>$1</b>',
    },

    // Speed and movement
    {
        pattern: /((movement|flying|swimming|climbing)\s*(speed)?)/gi,
        replacement: '<b>$1</b>',
    },

    // Area shapes
    {
        pattern: /(cone|sphere|cylinder|cube|line|radius|diameter)/gi,
        replacement: '<b>$1</b>',
    },

    // Beginning and End of turns (removed "each" to avoid conflicts)
    {
        pattern: /(starts?|begin(ning|s)?|ends?)\s+(of)?\s+(your|its|the|their)?/gi,
        replacement: '<b>$1</b>',
    },

    // Targeting and entities
    {
        pattern: /(creatures?|targets?|person|people|entit(y|ies)?|ally|allies|enemy|enemies|opponents?|characters?|players?|NPCs?)/gi,
        replacement: '<b>$1</b>',
    },

    // Time measurements
    {
        pattern: /(rounds?|minutes?|hours?|days?|turns?)/gi,
        replacement: '<b>$1</b>',
    },

    // Targeting modifiers and actions
    {
        pattern: /(choose|each|every|within|range|regains?|saves?|loses?)/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold ability scores and saving throws - Updated pattern
    {
        pattern: /(S?s?trength|D?d?exterity|C?c?onstitution|I?i?ntelligence|W?w?isdom|C?c?harisma|STR|DEX|CON|INT|WIS|CHA)/g,
        replacement: '<b>$1</b>',
    },
    
    // Bold successful / failed
    {
        pattern: /(success(ful)?|fail(ed)?|succeed)/gi,
        replacement: '<b>$1</b>',
    },

    // Bold checks and saving throws
    {
        pattern: /(checks?|saving throws?)/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold conditions (e.g., charmed, frightened, paralyzed)
    {
        pattern: /(blind(ed)?|charm(ed)?|deaf(ened)?|frightened|(grapple)d?|incapacitated?|invisible|paralyzed?|petrif(y|ied)?|poison(ed)?|prone|restrain(ed)?|stun(ned)?|unconscious|exhaust(ed|ion)?)/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold spell levels (e.g., "1st level", "3rd level")
    {
        pattern: /(\d+(st|nd|rd|th)?\s+levels?)/gi,
        replacement: '<b>$1</b>',
    },

    // Spell Stuff
    {
        pattern: /((cantrips?|rituals?|concentration|spells?)\s*(slots?)?)/gi,
        replacement: '<b>$1</b>',
    },
    
    // Bold property names (like "Casting time", "Range", "Components")
    {
        pattern: /^property\s*\|\s*([^|:]+):?\s*/gm,
        replacement: 'property | <b>$1:</b> ',
    },
    
    // To add a new rule, add a comma after the closing brace above and add your new rule:
    /*
    ,{
        pattern: /your-regex-here/g,
        replacement: '<b>$1</b>',
    }
    */
];