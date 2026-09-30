import { LearningJourney, WorkshopRole } from '../types/griot';

export const WORKSHOP_ROLES: WorkshopRole[] = [
  {
    id: 'griot',
    title: 'Le Griot de Table',
    nameEn: 'Table Griot (Narrator & Voice)',
    shortDescription: 'Holds the smartphone, reads or plays the story, keeps the group focused and harmonious.',
    actionInstruction: 'Read each prompt out loud clearly. Make sure everyone in the circle hears before anyone answers.',
    iconName: 'Sparkles',
  },
  {
    id: 'scribe',
    title: 'Le Scribe du Conseil',
    nameEn: 'Council Scribe (Writer & Slate Keeper)',
    shortDescription: 'Writes notes on the slate or notebook and records the group’s final agreed decision.',
    actionInstruction: 'Do not write your own opinion alone! Wait until at least 5 teammates agree, then write on the slate.',
    iconName: 'PenTool',
  },
  {
    id: 'architect',
    title: 'L’Architecte-Géomètre',
    nameEn: 'Master Builder (Hands-on Manipulator)',
    shortDescription: 'Leads the physical challenge with sticks, chalk, geometric drawing, or spatial counting.',
    actionInstruction: 'Use your fingers, sticks, and rulers to test the shape before the group votes.',
    iconName: 'Ruler',
  },
  {
    id: 'orator',
    title: 'L’Orateur du Cercle',
    nameEn: 'Plenary Orator (Class Spokesperson)',
    shortDescription: 'Prepares the 60-second summary to stand up and speak on behalf of the 8 students during the Grand Council.',
    actionInstruction: 'Rehearse your 1-minute speech with your group before the rotation bell rings.',
    iconName: 'Megaphone',
  },
];

export const DEFAULT_JOURNEYS: LearningJourney[] = [
  {
    id: 'sundiata-keita',
    title: 'Sundiata Keita & The Epic of Old Mali',
    subtitle: 'From an exile who could not walk to the founder of one of history’s greatest empires',
    culture: 'Manden / Sahel Empire',
    period: '13th Century (c. 1235 AD)',
    theme: 'Justice, Strategy & Collective Strength',
    icon: 'Crown',
    materialsNeeded: 'Slate, chalk, 8 equal wooden sticks or pencils, 1 piece of string (30 cm)',
    coreQuestion: 'How did Sundiata unite divided clans and build an empire that lasted centuries without relying solely on force?',
    griotPrologue: `Listen closely, children of the baobab! I speak to you of Sundiata Keita, the Lion Prince of Manden. In his youth, critics whispered that he would never walk. He crawled on all fours, while others laughed. Yet his mother Sogolon instilled in him the patient strength of the river stone.

When the sorcerer-king Soumaoro Kanté conquered the homeland with his fearsome iron army, Manden wept. But Sundiata grasped an iron rod, planted it into the earth, and through pure will and discipline, stood on his own two feet! He rallied twelve divided kingdoms not merely by spear, but by wisdom, shared law, and geometric ingenuity.

Today, your circle of eight students will walk the dusty path of the Manden warriors. One group will master the geometry of the defensive fortress; another will study the Kurukan Fuga—the ancient human rights charter; and a third will navigate the vital trade corridors of the Niger River. At the end of the day, your discoveries will unite at the Grand Council!`,
    workshops: [
      {
        id: 'workshop-geometry',
        title: 'The Fortress of Tabon: Perimeter & Archer Trajectories',
        subject: 'Geometry & Measurement',
        curriculumConnection: 'Perimeters, regular polygons, obtuse/acute angles & range ratios',
        contextStory: 'Before facing Soumaoro, Sundiata had to fortify the hill outpost of Tabon. The masons needed to build a defensive wall that gave 360-degree protection with the minimum amount of stone blocks, while ensuring archery angles covered every approaching canyon.',
        handsOnChallenge: 'Place your 8 equal wooden sticks on the desk. Experiment with building different regular polygons (a square using 4, a hexagon using 6, an octagon using all 8).',
        interactiveSteps: [
          'Arrange 8 sticks into an equilateral octagon (8 equal sides). Count the vertices.',
          'Notice: With 8 sticks, which shape encloses the LARGEST area for the soldiers inside: a long thin rectangle or an equilateral octagon?',
          'Discuss with your group: If an enemy approaches from 60 meters away, which angle from the watchtower gives the widest field of vision?'
        ],
        groupQuestion: 'If you have a fixed perimeter of 40 meters of stone wall, which regular shape encloses the maximum safe ground area for the villagers inside?',
        options: [
          'A long narrow rectangle (2m by 18m)',
          'A square (10m by 10m)',
          'A regular octagon or circle-like polygon',
          'A triangle with two very long sides'
        ],
        correctOptionIndex: 2,
        explanation: 'In geometry, as a regular polygon gains more equal sides (approaching a circle), it encloses the maximum area for any given perimeter (the isoperimetric principle). Ancient African master builders used octagonal and curved compounds to maximize living space while saving stone and mud bricks!',
        hints: [
          'Try calculating: Rectangle area = 2 × 18 = 36 m². Square area = 10 × 10 = 100 m².',
          'Now imagine smoothing out the corners with 8 equal sides. The area increases even more!',
          'Griot’s Secret: Nature favors the curve and the round compound because the circle holds the universe with the shortest boundary.'
        ],
        teacherGuideNote: 'Check that students are physically moving their sticks and comparing enclosed interior space, not just guessing.'
      },
      {
        id: 'workshop-writing',
        title: 'The Oath of Kurukan Fuga: Drafting the Peace Charter',
        subject: 'Writing & Oral Debate',
        curriculumConnection: 'Rhetorical structure, ethical reasoning, oral preamble & civic rights',
        contextStory: 'In 1236 AD, under the great baobab of Kurukan Fuga, Sundiata gathered chiefs, artisans, women, and griots to proclaim one of humanity’s first charters of universal rights. They debated how to prevent tyranny, protect travelers, and guarantee that no one is mistreated.',
        handsOnChallenge: 'The Scribe prepares the slate. The 8 students must each propose one sacred rule for your classroom community.',
        interactiveSteps: [
          'Read Article 24 of Kurukan Fuga: "Never offend women, for they are our mothers and the source of life."',
          'Read Article 5: "Everyone has a right to life and the preservation of physical integrity."',
          'Circle debate: Each of the 8 students has 20 seconds to speak. What is the single most vital rule to keep peace in a class of 60 children?'
        ],
        groupQuestion: 'Which principle from the Kurukan Fuga Charter is most essential for resolving conflicts without violence in a large group?',
        options: [
          'The strongest student decides all disputes',
          'Sanankuya (Joking kinship): defusing tension through humor and mutual family respect',
          'Keeping grievances secret until they explode',
          'Paying gold to avoid admitting mistakes'
        ],
        correctOptionIndex: 1,
        explanation: 'Sanankuya (a traditional Manding cultural institution of "joking relationship") allowed different ethnic groups and families to tease each other harmlessly, instantly cooling anger and preventing bloodshed. It is recognized by UNESCO as an intangible cultural heritage for conflict resolution!',
        hints: [
          'Think about what breaks tension in your schoolyard when two friends are about to argue.',
          'Is punishment better, or a cultural habit of laughter and shared ancestral bond?',
          'Griot’s Secret: The sharpest blade is dulled by a shared smile between brothers and sisters.'
        ],
        teacherGuideNote: 'Ensure the Orator is taking bullet points on the slate to summarize during the plenary presentation.'
      },
      {
        id: 'workshop-geography',
        title: 'The Great Niger River & The Golden Trade Trails',
        subject: 'Geography & Living History',
        curriculumConnection: 'River basin topography, seasonal flooding, trans-Saharan trade logistics & caravan planning',
        contextStory: 'Mali’s prosperity depended on controlling the inland Niger Delta. From Niani to Timbuktu and Gao, the river was a liquid highway. Gold from the southern forests of Bambuk met salt rock from the northern Sahara desert of Taghaza.',
        handsOnChallenge: 'Draw a curving line on your slate representing the Niger River bend (the "Great Arch"). Mark where the desert meets the green savanna.',
        interactiveSteps: [
          'Trace the route: Why did trade towns grow exactly at the "elbow" of the Niger River where it touches the Sahara?',
          'Calculate travel days: A camel caravan walks 30 km per day. Between Taghaza (salt mines) and Timbuktu is roughly 600 km across desert sands. How many days without well water?',
          'Discuss: Why was a slab of salt from the desert equal in value to a pouch of gold from the river valleys?'
        ],
        groupQuestion: 'Why did the city of Timbuktu and the Mali Empire flourish specifically at the northern loop of the Niger River?',
        options: [
          'Because it was completely hidden in dense mountains',
          'It was the exact meeting point where desert camel caravans could transfer goods directly onto river canoes',
          'It had the coldest climate in West Africa',
          'It was surrounded by impassable swamps that prevented any trade'
        ],
        correctOptionIndex: 1,
        explanation: 'Timbuktu was the natural port of the desert! Camels cannot survive in the humid southern tsetse-fly zones, and river boats cannot sail across sand dunes. The northern bend of the Niger was the ideal transfer hub between Sahara merchants and tropical river traders.',
        hints: [
          'Think about where boats stop and where camels start.',
          'Look at how the river arches up towards the dry sands before flowing down to the ocean.',
          'Griot’s Secret: Where the camel kneels to drink from the pirogue, there wealth and knowledge multiply.'
        ],
        teacherGuideNote: 'Check if students understand the economic complementarity of gold (south) and salt (north).'
      }
    ],
    plenaryCouncil: {
      title: 'The Assembly of the Twelve Doors of Mali',
      description: 'The 3 workshops now come together. Each group’s Orator will present how their discipline helped Sundiata unite the empire.',
      finalChallengePrompt: 'How did the combination of Octagonal Fortifications (Geometry), the Kurukan Fuga Charter (Writing/Civics), and the River Trade Ports (Geography) transform Mali from a war-torn land into a flourishing civilization of peace?'
    }
  },
  {
    id: 'djenne-masons',
    title: 'The Master Masons of Djenné & Earth Architecture',
    subtitle: 'The engineering brilliance of the world’s largest mud-brick monument',
    culture: 'Inland Niger Delta / Songhai & Fulani',
    period: '14th - 20th Century Tradition',
    theme: 'Sustainable Engineering & Communal Solidarity',
    icon: 'Landmark',
    materialsNeeded: 'Slate, chalk, 1 small cup of dry dirt or soil (if available), 1 ruler or 15cm stick',
    coreQuestion: 'How can buildings made purely from sun-baked mud and rice husks stay cool in 45°C desert heat and stand for hundreds of years?',
    griotPrologue: `In the middle of the inland delta, where the Bani River embraces the Niger, rises the magnificent Great Mosque of Djenné—a cathedral of sculpted earth! No imported steel, no burning coal for cement. Only clay, rice husks, baobab fruit oil, and the genius of the Barey-Ton master masons.

Every year, after the torrential rains, the entire city gathers for the *Crépissage*—the replastering festival. Boys race with baskets of fresh mud, musicians play djembe rhythms to keep the pace, elders guide the plasterers, and women carry fresh river water. In a single day, the city renews its monument!

Today, your groups will explore how mud geometry insulates against scorching heat, how the masons’ oral guild organizes hundreds of workers without blueprints, and how seasonal river floods renew the sacred clay.`,
    workshops: [
      {
        id: 'workshop-geometry',
        title: 'Thermal Inertia & The Mud-Brick Golden Arch',
        subject: 'Geometry & Physics',
        curriculumConnection: 'Wall thickness ratios, structural arches, surface area-to-volume ratio & solar angles',
        contextStory: 'Outside the mosque, the midday sun blazes at 43°C. Yet inside the prayer hall, the temperature remains a cool 24°C without any fans or air conditioning. How did the masons achieve this purely through geometric proportions?',
        handsOnChallenge: 'Draw two cross-sections of a wall on your slate: one thin (10 cm) and one thick (50 cm with tapered base). Draw the path of heat rays penetrating.',
        interactiveSteps: [
          'Calculate: If heat travels through dense mud plaster at roughly 3 centimeters per hour, how long will it take midday sun heat to penetrate a 45 cm thick wall?',
          'Notice the result: 45 cm ÷ 3 cm/hour = 15 hours! By the time heat reaches the inside, it is midnight and cool outside!',
          'Examine the roof arches: Why are the openings rounded arches rather than flat beams of wood?'
        ],
        groupQuestion: 'What geometric feature enables Djenné’s mud arches to support massive multi-ton ceilings without collapsing?',
        options: [
          'The arches use hidden iron rebar imported from Europe',
          'The curved arch directs downward gravitational force outward and down into the thick supporting pillars (compression)',
          'The mud is glued with honey so it cannot fall',
          'The roofs are made of paper so there is no weight'
        ],
        correctOptionIndex: 1,
        explanation: 'Mud-brick (banco) has tremendous compressive strength (it can resist being squashed), but very weak tensile strength (it cracks if pulled or bent). A parabolic or rounded arch puts all the bricks under compression, transferring weight safely into the sturdy buttress pillars!',
        hints: [
          'Think of what happens when you press two bricks together versus trying to bend a brick.',
          'Look at how the keystone at the peak of an arch wedges the other bricks tight.',
          'Griot’s Secret: Stand like an arch with your feet wide; the weight of the sky presses you firmer into the ground.'
        ],
        teacherGuideNote: 'Ask students to press their palms together in an arch shape to feel mutual compression.'
      },
      {
        id: 'workshop-writing',
        title: 'The Oral Charter of the Barey-Ton Guild',
        subject: 'Writing & Oral Debate',
        curriculumConnection: 'Apprenticeship traditions, guild rules, ceremonial speeches & civic mobilization',
        contextStory: 'The Barey-Ton is the ancient fraternity of Djenné masons. Knowledge is passed from master to apprentice through proverbs and oral poems. Before a single basket of mud is mixed, the master mason addresses the youth with a ceremonial speech.',
        handsOnChallenge: 'The Scribe writes down 3 rhyming or rhythmic lines on the slate that a master mason would call out to coordinate the mud mixers.',
        interactiveSteps: [
          'Read the mason proverb: "The wall built with haste in the morning is swallowed by the river at dusk."',
          'Role-play: Student 1 acts as Master Mason; Students 2-8 act as young apprentices carrying banco.',
          'Draft a brief 4-line invocation reminding workers that building together creates brotherhood.'
        ],
        groupQuestion: 'Why did the Barey-Ton guild prohibit written blueprints, relying entirely on collective oral apprenticeship and hands-on chanting?',
        options: [
          'They wanted to keep all architectural knowledge completely secret so no other city could build',
          'Oral learning ensured that every mason mastered the tactile feel and moisture of the clay directly with their hands, fostering living communal trust',
          'Paper was illegal in Mali',
          'Because drawings cannot show straight lines'
        ],
        correctOptionIndex: 1,
        explanation: 'In earth architecture, soil moisture and sand proportions change with every river flood. Blueprint drawings cannot tell you if the clay has the right plasticity. Masons learned through touch, muscle memory, and communal songs passed down through active generational brotherhood.',
        hints: [
          'Can a piece of paper tell you if mud is too wet or too sticky?',
          'How does singing a rhythm help 50 people hoist heavy timbers together?',
          'Griot’s Secret: When hands touch the earth together, the song becomes the plumb line.'
        ],
        teacherGuideNote: 'Check if groups are practicing reciting their ceremonial chants aloud.'
      },
      {
        id: 'workshop-geography',
        title: 'The Bani River Flood & The Alluvial Clay Basin',
        subject: 'Geography & Environmental Science',
        curriculumConnection: 'River sedimentation, seasonal floodplains, sustainable local materials & microclimates',
        contextStory: 'The materials to build Djenné do not come from distant factories. They are born from the annual flooding of the Bani and Niger rivers. When the water retreats in November, it leaves behind rich clay sediments mixed with river shells and silts.',
        handsOnChallenge: 'Draw the seasonal cycle on your slate: 1) Rainy Season (June-Sept), 2) Flood Inundation (Oct-Dec), 3) Drying & Harvesting (Jan-March), 4) Crépissage Festival (April).',
        interactiveSteps: [
          'Trace how the flood isolates Djenné like an island for several months each year.',
          'Examine the ingredients: Clay silt + Rice husks (from nearby paddies) + Baobab tree tannins (natural waterproofing).',
          'Discuss: What happens to modern concrete buildings when temperatures reach 45°C compared to mud buildings?'
        ],
        groupQuestion: 'Why is traditional banco (mud-earth) architecture considered one of the most environmentally sustainable building methods on Earth?',
        options: [
          'It requires burning huge quantities of wood and coal',
          'It is 100% biodegradable, harvested locally with zero carbon footprint, and acts as a natural thermal battery',
          'It only lasts for one week before washing away completely',
          'It can only be built during winter snowstorms'
        ],
        correctOptionIndex: 1,
        explanation: 'Earth architecture produces nearly zero greenhouse emissions, uses 100% renewable local soils, and at the end of its life, returns cleanly to the soil without toxic waste. Modern architects worldwide now study Djenné to design eco-friendly cities!',
        hints: [
          'Where did the mud come from? Just 500 meters away at the riverbank.',
          'What happens if a mud wall crumbles after 100 years? It turns back into garden earth.',
          'Griot’s Secret: The earth that feeds you is the earth that shelters you; treat both with reverence.'
        ],
        teacherGuideNote: 'Help students connect ancient local African technology with contemporary green architecture.'
      }
    ],
    plenaryCouncil: {
      title: 'The Grand Plenary of the Barey-Ton',
      description: 'The groups report their findings on Thermal Arches, Guild Solidarity, and River Ecology.',
      finalChallengePrompt: 'How can modern towns learn from Djenné to build schools and houses that stay naturally cool without expensive electricity, using local solidarity?'
    }
  },
  {
    id: 'queen-amina',
    title: 'Queen Amina of Zazzau: Engineering the City Walls',
    subtitle: 'The 16th-century warrior queen who fortified northern Nigeria with 30,000 meters of earth walls',
    culture: 'Hausaland (Zazzau / Zaria, Nigeria)',
    period: '16th Century (c. 1576 AD)',
    theme: 'Leadership, Strategic Engineering & Defense',
    icon: 'Shield',
    materialsNeeded: 'Slate, chalk, 8 equal sticks, string, 1 coin or flat stone',
    coreQuestion: 'How did Queen Amina use geometric engineering and diplomacy to turn a modest city into the sovereign hub of Hausaland trade?',
    griotPrologue: `In the northern savannas of what is now Nigeria, the drums of Zazzau beat in tribute to a queen whose name made sultans tremble: Queen Amina! While others expected a princess to remain in the palace courts, Amina rode alongside her cavalry at age sixteen, spear in hand.

When she ascended the throne, she did something revolutionary: she did not just conquer territory; she engineered it! Around every conquered settlement, she commanded the construction of colossal earth ramparts—*Ganuwar Amina* (the Walls of Amina)—some stretching over 15 kilometers in circumference, with 8 fortified gates and moat ditches.

Today, your groups will calculate the geometry of these monumental walls, write a royal diplomatic treaty to safeguard Saharan merchants, and map the iron smelting and trade crossroads that fueled her reign!`,
    workshops: [
      {
        id: 'workshop-geometry',
        title: 'Ganuwar Amina: The Fortified Circumference & Watchtowers',
        subject: 'Geometry & Measurement',
        curriculumConnection: 'Circumference, diameter, polygonal perimeters & line-of-sight spacing',
        contextStory: 'Amina’s engineers had to enclose a city with a radius of roughly 2.5 kilometers. They needed to place watchtowers along the wall so that archers stationed on Tower A could overlap their arrows with Tower B without any blind spots.',
        handsOnChallenge: 'Draw a circle on your slate using a string pegged at the center. Mark 8 equally spaced points along the edge representing the 8 Gates of Zazzau.',
        interactiveSteps: [
          'Recall the formula for circumference: C ≈ 2 × π × radius (or roughly 6.28 × radius).',
          'If the radius from the central market to the wall is 2.5 km, calculate the total length of the wall: 2 × 3.14 × 2.5 km ≈ 15.7 kilometers!',
          'If an effective Hausa composite bow has an arrow range of 150 meters, what is the maximum distance two watchtowers can be separated so their arrows cross?'
        ],
        groupQuestion: 'To ensure complete perimeter coverage with 150m bowshot range from both sides, how far apart can two defensive towers be situated?',
        options: [
          '50 meters apart',
          '300 meters apart (150m + 150m)',
          '1,000 meters apart',
          '5,000 meters apart'
        ],
        correctOptionIndex: 1,
        explanation: 'With each archer covering 150 meters in their direction, placing towers up to 300 meters apart ensures their effective ranges meet in the center, leaving zero blind spots for infiltrators. Amina’s builders placed towers approximately every 200–250 meters for overlapping firepower!',
        hints: [
          'Archer 1 shoots 150m to the right; Archer 2 shoots 150m to the left.',
          'Add 150 + 150 to find where their arrows meet.',
          'Griot’s Secret: A wall is only as strong as its blind spots; let no gap exist between two guardians.'
        ],
        teacherGuideNote: 'Check if students are adding the two radii of arrow range.'
      },
      {
        id: 'workshop-writing',
        title: 'The Royal Decree of Safe Caravan Passage',
        subject: 'Writing & Diplomatic Rhetoric',
        curriculumConnection: 'Treaty drafting, formal address, persuasion & economic guarantees',
        contextStory: 'Traders feared crossing bandit-infested borders. Amina wrote diplomatic pacts offering merchants total protection within Zazzau territory, in exchange for fair taxes in kola nuts, dyed fabrics, and Arabian horses.',
        handsOnChallenge: 'The Scribe drafts a 3-article "Safe Merchant Decree" bearing the seal of Queen Amina on the slate.',
        interactiveSteps: [
          'Define the greeting: "From Amina, Queen of Zazzau, to the Caravan Masters of the North..."',
          'Article 1: Guarantee of security (any bandit caught within 1 league of the wall faces trial).',
          'Article 2: Fair market weights and inspection at the 8 Gates.',
          'Article 3: Mutual promise of honest payment.'
        ],
        groupQuestion: 'What made Queen Amina’s diplomatic letters so persuasive that merchants chose Zazzau over rival trade cities?',
        options: [
          'She threatened to execute any merchant who visited other cities',
          'She backed her promises with physical fortress walls, honest market scales, and armed escorts along the trade highways',
          'She promised free gold to anyone who arrived',
          'She refused to allow any foreign visitors into the city'
        ],
        correctOptionIndex: 1,
        explanation: 'Commerce only thrives where there is security and predictability! Merchants knew that within Amina’s walled kingdom, their goods would not be stolen, contracts were enforced, and fair measurements were guaranteed by the royal court.',
        hints: [
          'Would you shop at a market where prices change randomly and thieves lurk?',
          'Trust and safety are the real foundations of trade.',
          'Griot’s Secret: The queen’s spear defended the wall, but her justice filled the treasury.'
        ],
        teacherGuideNote: 'Have the group’s Orator practice reading the Royal Decree with authority and poise.'
      },
      {
        id: 'workshop-geography',
        title: 'Hausaland Crossroads & The Nok Iron Legacy',
        subject: 'Geography & Technology History',
        curriculumConnection: 'Natural mineral distribution, iron smelting furnaces, vegetation zones & transport hubs',
        contextStory: 'Why was Zazzau able to forge thousands of spears, horse harnesses, and agricultural hoes? The region sat upon rich laterite iron-ore deposits, continuing the ancient iron smelting technologies perfected by the Nok civilization 2,000 years prior.',
        handsOnChallenge: 'Sketch a map on your slate showing: 1) The Saharan Desert (North), 2) The Hausa Savanna (Center), 3) The Guinea Rainforest (South). Draw arrows showing what each region exchanged.',
        interactiveSteps: [
          'North provides: Salt slabs, copper, horses, leather.',
          'South provides: Kola nuts, palm oil, ivory, timber.',
          'Zazzau (Center) provides: Forged iron tools, grains, cotton textiles, and secure walled markets.'
        ],
        groupQuestion: 'How did geographical location between the arid Sahara and the wet tropical forest give Queen Amina’s kingdom an unbeatable economic advantage?',
        options: [
          'She was completely cut off from all neighbors',
          'She served as the unavoidable intermediary bridge where desert caravans exchanged goods with rainforest merchants',
          'Her kingdom had the only ocean port in Africa',
          'She only traded with polar explorers'
        ],
        correctOptionIndex: 1,
        explanation: 'Zazzau occupied the ecological transition zone (ecotone)! Rainforest traders could not bring their pack animals into the arid desert, and Saharan camels could not survive in the humid tsetse-fly forests. The Hausa kingdoms were the indispensable middle ground.',
        hints: [
          'Look at where the desert ends and where trees begin.',
          'Why do merchants need a middle meeting place?',
          'Griot’s Secret: He who controls the bridge collects the toll from both shores.'
        ],
        teacherGuideNote: 'Check the student slate drawings for the 3 ecological zones.'
      }
    ],
    plenaryCouncil: {
      title: 'The Council of the Hausa Queens & Kings',
      description: 'The groups unite to present the military geometry, diplomatic decrees, and iron geography of Queen Amina.',
      finalChallengePrompt: 'How did Queen Amina prove that great leadership requires both physical engineering (walls/roads) and social engineering (fair laws and trusted commerce)?'
    }
  },
  {
    id: 'wangari-maathai',
    title: 'Wangari Maathai & The Green Belt Movement',
    subtitle: 'How rural mothers and saplings healed the soils and restored the rivers of Kenya',
    culture: 'East Africa / Mount Kenya',
    period: '20th Century (1977 - 2004 Nobel Peace Prize)',
    theme: 'Ecology, Courage, Civic Action & Mathematics of Nature',
    icon: 'Trees',
    materialsNeeded: 'Slate, chalk, 8 twigs/leaves, 1 ruler',
    coreQuestion: 'How did planting 30 million trees in small community groups stop desertification, recharge drying rivers, and win a Nobel Peace Prize?',
    griotPrologue: `In the central highlands of Kenya, beneath the snows of Mount Kenya, Professor Wangari Maathai walked across the hills where she had played as a child. But something was terribly wrong. The sparkling streams of her youth were dry mud gullies. The great fig trees had been chopped down for commercial tea estates.

Rural mothers came to her weeping: "Our firewood is gone. We walk ten kilometers every morning just to find dry sticks. The rains no longer come, and the soil washes away into the sea."

Wangari did not wait for distant politicians. She gathered seven women in her backyard, gave them seedlings, and said: "If you want to heal the earth, start where your feet touch the ground." That seed grew into the Green Belt Movement—planting over 30 million trees!

Today, your groups will calculate the geometry of tree canopy root grids, write a speech defending public parks, and analyze watershed geography!`,
    workshops: [
      {
        id: 'workshop-geometry',
        title: 'The Hexagonal Root Grid & Hillside Slope Physics',
        subject: 'Geometry & Environmental Math',
        curriculumConnection: 'Hexagonal tiling, root surface coverage, slope angles & rainwater infiltration rates',
        contextStory: 'When rain falls on a bare 20-degree hillside, water rushes at 5 meters per second, scouring away 50 tons of topsoil per hectare. When trees are planted in an interlocking staggered grid, the roots interlace like woven cloth, holding the soil tight.',
        handsOnChallenge: 'Draw two planting patterns on your slate: Pattern A (square grid) vs Pattern B (hexagonal honeycomb staggered grid). Use 8 small dots.',
        interactiveSteps: [
          'Count the distance between trees in a square grid vs staggered hexagonal honeycomb grid.',
          'Notice that a hexagonal grid leaves zero straight open erosion channels for water to run down the hill!',
          'Calculate: If each acacia sapling canopy covers a 3-meter radius circle, calculate the ground area shaded by one tree (Area ≈ 3.14 × 3² ≈ 28.2 m²).'
        ],
        groupQuestion: 'Why did Wangari Maathai’s team plant trees in staggered hexagonal rows along hillside contours instead of straight downhill lines?',
        options: [
          'Because straight downhill lines create natural gutters that speed up water runoff and wash the soil away faster',
          'Because hexagonal patterns are easier for tractors to run over',
          'Because bees only like trees planted in straight lines',
          'It was completely random and had no mathematical reason'
        ],
        correctOptionIndex: 0,
        explanation: 'Contour planting in staggered hexagonal patterns creates natural micro-terraces! Water hitting the hillside is forced to meander slowly around each tree trunk, allowing 85% of rainfall to sink into the deep groundwater aquifers instead of eroding the hillside.',
        hints: [
          'Imagine water flowing down a slide versus running through an obstacle course.',
          'Staggered trees force the water to stop and soak into the roots.',
          'Griot’s Secret: When you weave the roots of trees into the hillside, you sew the jacket that keeps Mother Earth warm.'
        ],
        teacherGuideNote: 'Check that students understand contour lines on hillsides.'
      },
      {
        id: 'workshop-writing',
        title: 'The Speech for Karura Forest: Defending Common Ground',
        subject: 'Writing & Civic Oratory',
        curriculumConnection: 'Persuasive rhetoric, metaphor, civic courage & public interest advocacy',
        contextStory: 'In 1998, developers and corrupt officials attempted to privatize and bulldoze Karura Forest, Nairobi’s last remaining green lung. Wangari Maathai and her group marched into the forest with tree seedlings, facing police batons with peaceful conviction.',
        handsOnChallenge: 'The Scribe and the group draft a 3-sentence battle-cry speech for Wangari to deliver in defense of the public forest.',
        interactiveSteps: [
          'Use the Hummingbird Parable: "A huge forest fire raged. All the big animals—the elephant, the lion—stood paralyzed. A tiny hummingbird flew back and forth with single drops of water in its beak. ‘What are you doing?’ laughed the beasts. The hummingbird replied: ‘I am doing the best I can.’"',
          'Each student suggests one powerful word: Courage, Breath, Future, Heritage, Roots.',
          'Draft the opening line: "This forest does not belong to private greed; it belongs to our grandchildren’s breath."'
        ],
        groupQuestion: 'What core rhetorical message did Wangari Maathai convey that inspired millions of ordinary citizens worldwide?',
        options: [
          'Only scientists with university degrees have the right to care for nature',
          'You do not need wealth or power to change your community; even the smallest act, multiplied by thousands of hands, transforms the world',
          'It is useless to plant trees because global warming cannot be stopped',
          'People should cut down all forests to build shopping malls'
        ],
        correctOptionIndex: 1,
        explanation: 'Wangari emphasized grassroots empowerment ("bottom-up change"). Rural women with no formal schooling became the foremost forestry experts in Africa, proving that genuine conservation begins with ordinary citizens protecting their local environment.',
        hints: [
          'Remember the parable of the tiny hummingbird carrying drops of water.',
          'Can one student in a classroom make a difference?',
          'Griot’s Secret: Little drops of water make a mighty ocean; single acorns make a cathedral of shade.'
        ],
        teacherGuideNote: 'Listen to the Orator deliver the group’s hummingbird speech.'
      },
      {
        id: 'workshop-geography',
        title: 'The Water Towers of Kenya & River Watershed Hydrology',
        subject: 'Geography & Earth Science',
        curriculumConnection: 'Water cycle, cloud forests, watershed drainage, transpiration & microclimate cooling',
        contextStory: 'Kenya has five major "water towers"—mountain cloud forests including Mount Kenya and the Aberdares. These high-altitude forests act as giant natural sponges, capturing moisture from monsoon clouds and releasing it slowly year-round into rivers like the Tana and Athi.',
        handsOnChallenge: 'Draw the water cycle on your slate: Clouds over Mount Kenya -> Tree Canopy Condensation -> Groundwater Sponge -> Valley River -> Village Well.',
        interactiveSteps: [
          'Trace what happens when the mountain forest is cut down: In the rainy season, violent floods destroy valley crops. In the dry season, the river completely dries up!',
          'Notice how 70% of Kenya’s electricity comes from hydroelectric dams powered by these mountain rivers.',
          'Discuss: Why is saving a forest 100 kilometers away vital for a city dweller turning on their tap?'
        ],
        groupQuestion: 'Why are mountain forests referred to as "Water Towers" by hydrologists and geographers?',
        options: [
          'Because metal water tanks are built in the tree branches',
          'Because cloud forests catch atmospheric mist and store billions of liters of water in sponge-like moss and soil, feeding rivers year-round',
          'Because mountain trees pump salt water from the ocean',
          'Because they are the highest towers ever built by humans'
        ],
        correctOptionIndex: 1,
        explanation: 'Cloud forests literally harvest water directly from the air through fog drip! The dense mosses, leaf litter, and deep tree root networks hold water like a colossal elevated sponge, trickling clean fresh water down to millions of people throughout the dry season.',
        hints: [
          'Think of what a kitchen sponge does when you drop water onto it.',
          'Without the sponge, where does the water go? It flashes away instantly.',
          'Griot’s Secret: Cut the hair of the mountain, and the river in the valley will cry tears of dust.'
        ],
        teacherGuideNote: 'Verify that students see the connection between mountain forests and valley tap water.'
      }
    ],
    plenaryCouncil: {
      title: 'The Green Assembly of the Hummingbirds',
      description: 'The groups report their findings on Hexagonal Root Math, Civic Advocacy, and Mountain Watershed Hydrology.',
      finalChallengePrompt: 'How does planting trees connect mathematics (spacing), civic courage (writing), and planetary geography to solve climate and hunger challenges in our own community?'
    }
  }
];
