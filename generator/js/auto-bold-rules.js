// Auto Bold Rules Configuration
// Add or modify rules here - each rule is an object with pattern, replacement, and description

var autoBoldRules = [
    {
        pattern: /\b(one\s+size\s+category(\s+larger|\s+smaller))\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(command word)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b((additional\s+)?(uses?))\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(Enormity)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(ammunition|ammo)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b((number\s+of\s+)?charges?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b((gargantuan|huge|large|medium|small|tiny)(\s+or\s+larger)?(\s+or\s+smaller)?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(long rest|short rest)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(bonus)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(proficiency)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(hits?)\b/gi,
        replacement: '<b>$1</b>',
    },
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
        pattern: /(\d+(?:x\d+)*)\s*-?f(ee|oo)?t/gi,
        replacement: '<b>$1 ft</b>',
    },
    {
        pattern: /(\d+)\s*(?:lb(.|s)?|pounds?)/gi,
        replacement: '<b>$1 lb.</b>',
    },
    {
        pattern: /(\d+d\d+(?:[+\-]\d+)?)/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(\d+)(?!\s*(?:lb|ft|d\d))\b/g,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(worn)?\s*(or)?\s*(carr(y|ied))/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(fire|cold|lightning|thunder|acid|poison|necrotic|radiant|psychic|force|piercing|slashing|bludgeoning)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(quadruple|double|half|halved|damage)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(Action)\b/gi,
        replacement: '$1',
    },
    {
        pattern: /\b((bonus|free)?\s+actions?|reactions?|interactions?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b((dis)?advantages?|critical\s*(hits?)?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(melee|ranged|magic\s+weapons?|weapons?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /(attacks?)/gi,
        replacement: '<b>$1</b>',
    },

    {
        pattern: /(rolls?)/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(DC|Difficulty Class|AC|Armor Class|HP|hit\s*points?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b((move|movement|flying|swimming|climbing)\s*(speed)?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(cone|sphere|cylinder|cube|line|radius|diameter)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(starts?|begin(?:ning|s)?|ends?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\bof\s+(yours?|its?|their)/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(creatures?|objects?|targets?|person|people|entit(y|ies)?|ally|allies|enemy|enemies|opponents?|characters?|players?|NPCs?)/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b((next)?\s*(rounds?|minutes?|hours?|days?|turns?))\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(choose|each|every|within|range|regains?|saves?|loses?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(S?s?trength|D?d?exterity|C?c?onstitution|I?i?ntelligence|W?w?isdom|C?c?harisma|STR|DEX|CON|INT|WIS|CHA)\b/g,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(success(ful)?|fail(ed)?|succeed)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(checks?|saving throws?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(blind(ed)?|charm(ed)?|deaf(ened)?|frightened|(grapple)d?|incapacitated?|invisible|paralyzed?|petrif(y|ied)?|poison(ed)?|prone|restrain(ed)?|stun(ned)?|unconscious|exhaust(ed|ion)?)\b/gi,
        replacement: '<b>$1</b>',
    },
    
    {
        pattern: /\b(\d+(st|nd|rd|th)?\s+levels?)\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /\b(cantrips?|rituals?|concentration|spell\s+(slots?)?\s+(levels?))\b/gi,
        replacement: '<b>$1</b>',
    },
    {
        pattern: /^property\s*\|\s*([^|:]+):?\s*/gm,
        replacement: 'property | $1: ',
    },
    {
        pattern: /^description\s*\|\s*([^|:]+):?\s*/gm,
        replacement: 'description | $1: ',
    },
    
    // To add a new rule, add a comma after the closing brace above and add your new rule:
    /*
    ,{
        pattern: /your-regex-here/g,
        replacement: '<b>$1</b>',
    }
    */
];