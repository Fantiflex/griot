import type { Journey } from '../../shared/types';

/**
 * Parcours de démonstration : Les marchands de Kilwa (côte swahilie, XIVe siècle).
 * Trois ateliers : mathématiques, langue & écriture, histoire & géographie.
 * Bilingue français / kiswahili.
 */
export const KILWA_JOURNEY: Journey = {
  id: 'kilwa-merchants',
  title: { fr: 'Les marchands de Kilwa', sw: 'Wafanyabiashara wa Kilwa' },
  subtitle: {
    fr: 'Comment une île de la côte swahilie est devenue le carrefour de l’océan Indien',
    sw: 'Jinsi kisiwa cha pwani ya Waswahili kilivyokuwa kitovu cha Bahari ya Hindi',
  },
  culture: { fr: 'Côte swahilie, sultanat de Kilwa', sw: 'Pwani ya Waswahili, Usultani wa Kilwa' },
  period: { fr: 'XIVe siècle (vers 1331)', sw: 'Karne ya 14 (karibu 1331)' },
  theme: { fr: 'Échange, mesure et parole juste', sw: 'Biashara, kipimo na neno la haki' },
  prologue: {
    fr: `Écoutez, enfants du baobab. Je vous parle de Kilwa Kisiwani, une île de corail au large de la Tanzanie d’aujourd’hui. Au XIVe siècle, ses marchés résonnaient de dix langues. Des boutres aux voiles triangulaires arrivaient d’Arabie, de Perse et d’Inde, poussés par le vent de mousson.

Les marchands de Kilwa ne comptaient pas avec des pièces de monnaie comme nous. Ils échangeaient : tant de sacs de riz contre tant de rouleaux de tissu, tant de défenses d’ivoire contre tant de perles. Pour ne pas être trompés, ils devaient savoir compter, mesurer et parler avec justesse.

Aujourd’hui, votre table devient une table de marchands de Kilwa. Un groupe apprendra les proportions des échanges, un autre l’art des proverbes et des décrets, un troisième les routes du vent et de l’or. Au Grand Conseil, vous répondrez ensemble à la question du sultan.`,
    sw: `Sikilizeni, watoto wa mbuyu. Nawasimulia habari za Kilwa Kisiwani, kisiwa cha matumbawe karibu na Tanzania ya leo. Katika karne ya kumi na nne, masoko yake yalisikika lugha kumi. Majahazi yenye tanga za pembetatu yalifika kutoka Uarabuni, Uajemi na Uhindi, yakisukumwa na upepo wa monsuni.

Wafanyabiashara wa Kilwa hawakuhesabu kwa sarafu kama sisi. Walibadilishana: magunia kadhaa ya mchele kwa vitambaa kadhaa, pembe kadhaa za ndovu kwa shanga kadhaa. Ili wasidanganywe, walipaswa kujua kuhesabu, kupima na kusema kwa haki.

Leo, meza yenu inakuwa meza ya wafanyabiashara wa Kilwa. Kikundi kimoja kitajifunza uwiano wa biashara, kingine sanaa ya methali na amri, cha tatu njia za upepo na dhahabu. Katika Baraza Kuu, mtajibu pamoja swali la sultani.`,
  },
  coreQuestion: {
    fr: 'Pourquoi Kilwa est-elle devenue riche sans armée puissante, et qu’est-ce qui a permis à ses marchés d’être justes ?',
    sw: 'Kwa nini Kilwa ilitajirika bila jeshi kubwa, na ni nini kilichofanya masoko yake yawe ya haki?',
  },
  workshops: [
    {
      id: 'kilwa-math',
      subject: 'math',
      title: { fr: 'Le marché des proportions', sw: 'Soko la uwiano' },
      curriculum: {
        fr: 'Proportionnalité, fractions d’une quantité, multiplication décimale',
        sw: 'Uwiano, sehemu za kiasi, kuzidisha desimali',
      },
      contextStory: {
        fr: 'Sur le quai de Kilwa, un marchand indien propose du tissu contre du riz. Pas de monnaie : il faut compter juste, sinon le boutre repart avec votre riz et sans vous laisser assez de tissu pour le village.',
        sw: 'Kwenye gati la Kilwa, mfanyabiashara Mhindi anatoa kitambaa kwa mchele. Hakuna sarafu: lazima kuhesabu sawa, la sivyo jahazi litaondoka na mchele wenu bila kuacha kitambaa cha kutosha kwa kijiji.',
      },
      materials: { fr: 'Ardoise, craie, 12 cailloux ou graines', sw: 'Ubao, chaki, mawe au mbegu 12' },
      teacherNote: {
        fr: 'Vérifiez que le groupe passe par l’unité : combien de rouleaux pour 1 sac avant de calculer pour 12.',
        sw: 'Hakikisha kikundi kinapitia kitengo kimoja: vitambaa vingapi kwa gunia moja kabla ya kuhesabu kwa 12.',
      },
      steps: [
        {
          id: 'm-intro',
          kind: 'tell',
          lookAt: 'students',
          hints: [],
          prompt: {
            fr: 'Bienvenue à la table des marchands. Posez vos douze cailloux devant vous : chaque caillou est un sac de riz. Le scribe prend la craie. Quand je pose une question, discutez d’abord, puis écrivez une seule réponse sur l’ardoise.',
            sw: 'Karibuni kwenye meza ya wafanyabiashara. Wekeni mawe yenu kumi na mawili mbele yenu: kila jiwe ni gunia la mchele. Mwandishi achukue chaki. Nikiuliza swali, jadilini kwanza, kisha andikeni jibu moja tu ubaoni.',
          },
        },
        {
          id: 'm-ratio',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 240,
          prompt: {
            fr: 'Le marchand échange trois sacs de riz contre deux rouleaux de tissu. Votre village apporte douze sacs. Combien de rouleaux de tissu devez-vous recevoir ? Écrivez le nombre sur l’ardoise.',
            sw: 'Mfanyabiashara anabadilisha magunia matatu ya mchele kwa vitambaa viwili. Kijiji chenu kinaleta magunia kumi na mawili. Mnapaswa kupokea vitambaa vingapi? Andikeni namba ubaoni.',
          },
          expected: { fr: '8', sw: '8' },
          accept: ['8', 'huit', 'nane', '8 rouleaux', 'vitambaa 8'],
          rubric: {
            fr: 'La réponse est 8 rouleaux. Accepter 8 écrit en chiffres ou en lettres. Une réponse de 6 ou 4 montre que le groupe a confondu le sens de la proportion.',
            sw: 'Jibu ni vitambaa 8. Kubali 8 kwa namba au kwa maneno. Jibu la 6 au 4 linaonyesha kikundi kimechanganya uwiano.',
          },
          explanation: {
            fr: 'Douze sacs, c’est quatre fois trois sacs. Donc quatre fois deux rouleaux : huit rouleaux. Les marchands de Kilwa faisaient ce calcul de tête en groupant les sacs par trois.',
            sw: 'Magunia kumi na mawili ni mara nne ya magunia matatu. Kwa hiyo mara nne ya vitambaa viwili: vitambaa nane. Wafanyabiashara wa Kilwa walifanya hesabu hii kichwani kwa kupanga magunia matatu matatu.',
          },
          hints: [
            {
              fr: 'Groupez vos cailloux par paquets de trois. Combien de paquets obtenez-vous ?',
              sw: 'Pangeni mawe yenu katika vikundi vya matatu. Mnapata vikundi vingapi?',
            },
            {
              fr: 'Chaque paquet de trois sacs donne deux rouleaux. Quatre paquets donnent combien de rouleaux ?',
              sw: 'Kila kikundi cha magunia matatu kinatoa vitambaa viwili. Vikundi vinne vinatoa vitambaa vingapi?',
            },
            {
              fr: 'Secret du Griot : quand le riz est multiplié par quatre, le tissu l’est aussi. Multipliez deux par quatre.',
              sw: 'Siri ya Griot: mchele ukizidishwa mara nne, kitambaa pia. Zidisheni mbili mara nne.',
            },
          ],
        },
        {
          id: 'm-fraction',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 240,
          prompt: {
            fr: 'Un boutre transporte soixante sacs. Les trois quarts de ces sacs contiennent du riz, le reste contient du sel. Combien de sacs de riz y a-t-il ? Écrivez le nombre.',
            sw: 'Jahazi linabeba magunia sitini. Robo tatu ya magunia hayo yana mchele, mengine yana chumvi. Kuna magunia mangapi ya mchele? Andikeni namba.',
          },
          expected: { fr: '45', sw: '45' },
          accept: ['45', 'quarante-cinq', 'quarante cinq', 'arobaini na tano'],
          rubric: {
            fr: 'La réponse est 45. Une réponse de 15 montre que le groupe a calculé le quart au lieu des trois quarts.',
            sw: 'Jibu ni 45. Jibu la 15 linaonyesha kikundi kimehesabu robo moja badala ya robo tatu.',
          },
          explanation: {
            fr: 'Un quart de soixante, c’est quinze. Trois quarts, c’est trois fois quinze : quarante-cinq sacs de riz, et quinze sacs de sel.',
            sw: 'Robo ya sitini ni kumi na tano. Robo tatu ni mara tatu ya kumi na tano: magunia arobaini na tano ya mchele, na kumi na tano ya chumvi.',
          },
          hints: [
            {
              fr: 'Commencez par trouver un seul quart de soixante. Partagez soixante en quatre parts égales.',
              sw: 'Anzeni kwa kutafuta robo moja ya sitini. Gawanyeni sitini katika sehemu nne sawa.',
            },
            {
              fr: 'Un quart fait quinze. Il vous faut trois quarts, pas un seul.',
              sw: 'Robo moja ni kumi na tano. Mnahitaji robo tatu, si moja.',
            },
            {
              fr: 'Secret du Griot : trois quarts, c’est tout le boutre moins un quart. Soixante moins quinze.',
              sw: 'Siri ya Griot: robo tatu ni jahazi zima kasoro robo moja. Sitini kasoro kumi na tano.',
            },
          ],
        },
        {
          id: 'm-gold',
          kind: 'ask_choice',
          lookAt: 'students',
          prompt: {
            fr: 'L’or de Kilwa se pesait en mithqal. Un mithqal pèse quatre grammes et vingt-cinq centièmes. Combien pèsent quatre mithqal ? Discutez puis choisissez.',
            sw: 'Dhahabu ya Kilwa ilipimwa kwa mithqal. Mithqal moja ina uzito wa gramu nne nukta mbili tano. Mithqal nne zina uzito gani? Jadilini kisha chagueni.',
          },
          options: [
            { fr: '16 grammes', sw: 'Gramu 16' },
            { fr: '17 grammes', sw: 'Gramu 17' },
            { fr: '8,5 grammes', sw: 'Gramu 8,5' },
            { fr: '21 grammes', sw: 'Gramu 21' },
          ],
          correctIndex: 1,
          explanation: {
            fr: 'Quatre fois quatre grammes font seize grammes, et quatre fois vingt-cinq centièmes font un gramme entier. Seize plus un : dix-sept grammes.',
            sw: 'Mara nne ya gramu nne ni gramu kumi na sita, na mara nne ya nukta mbili tano ni gramu moja kamili. Kumi na sita jumlisha moja: gramu kumi na saba.',
          },
          hints: [
            {
              fr: 'Séparez les grammes entiers et les centièmes. Quatre fois quatre grammes d’abord.',
              sw: 'Tenganisheni gramu kamili na nukta. Mara nne ya gramu nne kwanza.',
            },
            {
              fr: 'Quatre fois vingt-cinq centièmes, c’est comme quatre quarts. Cela fait combien ?',
              sw: 'Mara nne ya nukta mbili tano ni kama robo nne. Ni ngapi?',
            },
          ],
        },
        {
          id: 'm-discuss',
          kind: 'discuss',
          lookAt: 'students',
          hints: [],
          prompt: {
            fr: 'Dernière question pour le cercle, sans ardoise : pourquoi les marchands de Kilwa préféraient-ils échanger par proportions plutôt qu’avec des pièces ? Que chacun donne une idée, puis l’orateur résume en une phrase.',
            sw: 'Swali la mwisho kwa duara, bila ubao: kwa nini wafanyabiashara wa Kilwa walipendelea kubadilishana kwa uwiano badala ya sarafu? Kila mmoja atoe wazo, kisha msemaji afupishe kwa sentensi moja.',
          },
        },
      ],
    },
    {
      id: 'kilwa-language',
      subject: 'language',
      title: { fr: 'Le proverbe et le décret', sw: 'Methali na amri' },
      curriculum: {
        fr: 'Compréhension d’un proverbe, orthographe, rédaction d’un texte court argumenté',
        sw: 'Kuelewa methali, tahajia, kuandika maandishi mafupi yenye hoja',
      },
      contextStory: {
        fr: 'Les marins de Kilwa chantaient un proverbe en chargeant les boutres, sac après sac. Le sultan, lui, faisait lire ses décrets à voix haute sur la place du marché pour que personne ne triche.',
        sw: 'Mabaharia wa Kilwa waliimba methali wakipakia majahazi, gunia baada ya gunia. Sultani naye alisomesha amri zake kwa sauti sokoni ili mtu yeyote asidanganye.',
      },
      materials: { fr: 'Ardoise, craie', sw: 'Ubao, chaki' },
      teacherNote: {
        fr: 'Écoutez si les huit voix ont parlé avant que le scribe écrive le décret.',
        sw: 'Sikiliza kama sauti zote nane zimesema kabla mwandishi hajaandika amri.',
      },
      steps: [
        {
          id: 'l-intro',
          kind: 'tell',
          lookAt: 'students',
          hints: [],
          prompt: {
            fr: 'Les marins de Kilwa chantaient en swahili : « Haba na haba hujaza kibaba ». Petit à petit, la mesure se remplit. Aujourd’hui, vous allez écrire ce proverbe, le comprendre, puis rédiger ensemble un décret du sultan.',
            sw: 'Mabaharia wa Kilwa waliimba: « Haba na haba hujaza kibaba ». Leo mtaandika methali hii, mtaielewa, kisha mtaandika pamoja amri ya sultani.',
          },
        },
        {
          id: 'l-dictation',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 180,
          prompt: {
            fr: 'Écrivez le proverbe en entier sur l’ardoise, en swahili, avec la bonne orthographe : « Haba na haba hujaza kibaba ». Je le répète lentement : Haba, na, haba, hujaza, kibaba.',
            sw: 'Andikeni methali nzima ubaoni kwa tahajia sahihi: « Haba na haba hujaza kibaba ». Narudia polepole: Haba, na, haba, hujaza, kibaba.',
          },
          expected: { fr: 'Haba na haba hujaza kibaba', sw: 'Haba na haba hujaza kibaba' },
          accept: ['haba na haba hujaza kibaba'],
          rubric: {
            fr: 'Accepter si les cinq mots sont présents dans l’ordre, avec au plus une faute d’orthographe mineure. Signaler précisément le mot mal écrit.',
            sw: 'Kubali kama maneno matano yapo kwa mpangilio sahihi, na kosa dogo moja tu la tahajia. Taja neno lililoandikwa vibaya.',
          },
          explanation: {
            fr: 'Haba veut dire « un peu », hujaza « remplit », kibaba est une mesure de grain. Petit à petit, la mesure se remplit.',
            sw: 'Haba maana yake ni « kidogo », hujaza ni « inajaza », kibaba ni kipimo cha nafaka. Kidogo kidogo, kipimo kinajaa.',
          },
          hints: [
            {
              fr: 'Il y a cinq mots. Comptez-les sur vos doigts avant d’écrire.',
              sw: 'Kuna maneno matano. Yahesabuni kwa vidole kabla ya kuandika.',
            },
            {
              fr: 'Le mot « haba » apparaît deux fois, séparé par « na », qui veut dire « et ».',
              sw: 'Neno « haba » linaonekana mara mbili, likitenganishwa na « na ».',
            },
          ],
        },
        {
          id: 'l-meaning',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 240,
          prompt: {
            fr: 'Maintenant, expliquez le proverbe avec vos mots. Écrivez une phrase : que veut dire « petit à petit, la mesure se remplit » pour un marin qui charge un boutre ?',
            sw: 'Sasa elezeni methali kwa maneno yenu. Andikeni sentensi moja: « haba na haba hujaza kibaba » ina maana gani kwa baharia anayepakia jahazi?',
          },
          rubric: {
            fr: 'Réponse ouverte. Accepter toute phrase qui exprime la patience, la persévérance, ou l’accumulation de petits efforts. Refuser une phrase hors sujet ou vide. Valoriser un exemple concret.',
            sw: 'Jibu huria. Kubali sentensi yoyote inayoonyesha uvumilivu, bidii, au mkusanyiko wa juhudi ndogo. Kataa sentensi isiyo na maana. Thamini mfano halisi.',
          },
          explanation: {
            fr: 'Un sac ne remplit pas un boutre, mais cent sacs portés un par un, oui. Le proverbe dit que la persévérance accomplit ce que la force seule ne peut pas.',
            sw: 'Gunia moja halijazi jahazi, lakini magunia mia yakibebwa moja moja, ndiyo. Methali inasema uvumilivu hutimiza kile nguvu peke yake haiwezi.',
          },
          hints: [
            {
              fr: 'Pensez au marin : il porte un sac, puis un autre. Que se passe-t-il s’il s’arrête ? Et s’il continue ?',
              sw: 'Fikirieni baharia: anabeba gunia moja, kisha jingine. Nini kinatokea akisimama? Na akiendelea?',
            },
            {
              fr: 'Commencez votre phrase par « Même si chaque sac est petit, ... »',
              sw: 'Anzeni sentensi yenu kwa « Hata kama kila gunia ni dogo, ... »',
            },
          ],
        },
        {
          id: 'l-decree',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 360,
          prompt: {
            fr: 'Vous êtes le conseil du sultan de Kilwa. Des marchands trichent sur les mesures de riz. Rédigez ensemble un décret de deux phrases pour que le marché redevienne juste. Chaque membre propose une idée, le scribe écrit la version choisie.',
            sw: 'Nyinyi ni baraza la sultani wa Kilwa. Wafanyabiashara wanadanganya kwenye vipimo vya mchele. Andikeni pamoja amri ya sentensi mbili ili soko lirudi kuwa la haki. Kila mwanachama atoe wazo, mwandishi aandike toleo lililochaguliwa.',
          },
          rubric: {
            fr: 'Réponse ouverte. Un bon décret nomme une règle précise (mesure officielle, contrôle, sanction proportionnée) et une raison (justice, confiance). Refuser les sanctions cruelles. Valoriser la clarté.',
            sw: 'Jibu huria. Amri nzuri inataja kanuni wazi (kipimo rasmi, ukaguzi, adhabu ya haki) na sababu (haki, imani). Kataa adhabu za kikatili. Thamini uwazi.',
          },
          explanation: {
            fr: 'Les vrais sultans de la côte faisaient garder une mesure étalon à la mosquée ou au palais : tout le monde pouvait venir comparer. La justice commence par une mesure que tous peuvent vérifier.',
            sw: 'Masultani halisi wa pwani waliweka kipimo cha kawaida msikitini au ikulu: kila mtu angeweza kuja kulinganisha. Haki huanza na kipimo ambacho wote wanaweza kukithibitisha.',
          },
          hints: [
            {
              fr: 'Un décret dit ce qui est obligatoire et ce qui arrive si on ne respecte pas la règle.',
              sw: 'Amri inasema kinacholazimika na kinachotokea mtu asipofuata kanuni.',
            },
            {
              fr: 'Où pourrait-on garder une mesure officielle que tous les marchands viendraient comparer ?',
              sw: 'Kipimo rasmi kingewekwa wapi ili wafanyabiashara wote waje kulinganisha?',
            },
          ],
        },
        {
          id: 'l-discuss',
          kind: 'discuss',
          lookAt: 'students',
          hints: [],
          prompt: {
            fr: 'L’orateur lit votre décret à voix haute, debout, comme sur la place de Kilwa. Le reste du groupe écoute et dit si chaque mot est clair. Quand vous êtes prêts, dites-moi de continuer.',
            sw: 'Msemaji asome amri yenu kwa sauti, akiwa amesimama, kama sokoni Kilwa. Wengine wasikilize na waseme kama kila neno liko wazi. Mkiwa tayari, niambieni niendelee.',
          },
        },
      ],
    },
    {
      id: 'kilwa-history',
      subject: 'history',
      title: { fr: 'Les routes du vent et de l’or', sw: 'Njia za upepo na dhahabu' },
      curriculum: {
        fr: 'Commerce de l’océan Indien, mousson, lecture de carte, sources historiques',
        sw: 'Biashara ya Bahari ya Hindi, monsuni, kusoma ramani, vyanzo vya historia',
      },
      contextStory: {
        fr: 'En 1331, le voyageur Ibn Battuta débarque à Kilwa et écrit que c’est l’une des plus belles villes du monde. D’où venait sa richesse ? De l’or de Sofala, de l’ivoire de l’intérieur, et d’un vent qui souffle six mois dans un sens, six mois dans l’autre.',
        sw: 'Mwaka 1331, msafiri Ibn Battuta anafika Kilwa na kuandika kuwa ni mojawapo ya miji mizuri zaidi duniani. Utajiri wake ulitoka wapi? Dhahabu ya Sofala, pembe za ndovu kutoka bara, na upepo unaovuma miezi sita upande mmoja, miezi sita upande mwingine.',
      },
      materials: { fr: 'Ardoise, craie, carte de l’océan Indien si disponible', sw: 'Ubao, chaki, ramani ya Bahari ya Hindi ikiwepo' },
      teacherNote: {
        fr: 'Vérifiez que le groupe a dessiné la côte, l’île, et une flèche pour chaque sens de la mousson.',
        sw: 'Hakikisha kikundi kimechora pwani, kisiwa, na mshale kwa kila upande wa monsuni.',
      },
      steps: [
        {
          id: 'h-intro',
          kind: 'tell',
          lookAt: 'students',
          hints: [],
          prompt: {
            fr: 'Le bâtisseur dessine sur l’ardoise la côte d’Afrique de l’Est, une petite île pour Kilwa, et au loin, l’Inde. Nous allons remplir cette carte avec les marchandises et les vents.',
            sw: 'Mjenzi achore ubaoni pwani ya Afrika Mashariki, kisiwa kidogo kwa Kilwa, na mbali, Uhindi. Tutaijaza ramani hii kwa bidhaa na pepo.',
          },
        },
        {
          id: 'h-traveler',
          kind: 'ask_choice',
          lookAt: 'students',
          prompt: {
            fr: 'Quel grand voyageur a visité Kilwa en 1331 et l’a décrite dans son récit de voyage ?',
            sw: 'Ni msafiri gani mkubwa aliyetembelea Kilwa mwaka 1331 na kuielezea katika safari zake?',
          },
          options: [
            { fr: 'Marco Polo', sw: 'Marco Polo' },
            { fr: 'Ibn Battuta', sw: 'Ibn Battuta' },
            { fr: 'Vasco de Gama', sw: 'Vasco da Gama' },
            { fr: 'Zheng He', sw: 'Zheng He' },
          ],
          correctIndex: 1,
          explanation: {
            fr: 'Ibn Battuta, né à Tanger, a voyagé trente ans. Il a décrit Kilwa comme une ville aux maisons de pierre et de corail, gouvernée par un sultan généreux. Vasco de Gama n’arrivera que 170 ans plus tard.',
            sw: 'Ibn Battuta, aliyezaliwa Tangier, alisafiri miaka thelathini. Alielezea Kilwa kama mji wa nyumba za mawe na matumbawe, ukitawaliwa na sultani mkarimu. Vasco da Gama alifika miaka 170 baadaye.',
          },
          hints: [
            {
              fr: 'Ce voyageur venait du Maroc et écrivait en arabe.',
              sw: 'Msafiri huyu alitoka Moroko na aliandika kwa Kiarabu.',
            },
          ],
        },
        {
          id: 'h-goods',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 240,
          prompt: {
            fr: 'Écrivez sur l’ardoise deux marchandises qui partaient de Kilwa vers l’Arabie, l’Inde ou la Chine.',
            sw: 'Andikeni ubaoni bidhaa mbili zilizotoka Kilwa kwenda Uarabuni, Uhindi au Uchina.',
          },
          expected: { fr: 'or, ivoire', sw: 'dhahabu, pembe za ndovu' },
          accept: ['or', 'ivoire', 'dhahabu', 'pembe', 'ndovu', 'fer', 'chuma', 'bois', 'mbao', 'écaille', 'ambre', 'cuivre', 'shaba'],
          rubric: {
            fr: 'Accepter si au moins deux marchandises exportées sont justes parmi : or, ivoire, fer, bois de mangrove, écaille de tortue, ambre gris, cuivre. Le tissu, la porcelaine et les perles étaient importés, pas exportés : le signaler gentiment.',
            sw: 'Kubali kama angalau bidhaa mbili zilizosafirishwa ni sahihi kati ya: dhahabu, pembe za ndovu, chuma, mbao za mikoko, gamba la kobe, ambari, shaba. Kitambaa, kauri na shanga ziliingizwa, hazikusafirishwa: taja kwa upole.',
          },
          explanation: {
            fr: 'L’or venait de Sofala et du Grand Zimbabwe, l’ivoire de l’intérieur des terres. En échange, Kilwa recevait des tissus d’Inde, de la porcelaine de Chine et des perles. Les archéologues ont trouvé des pièces chinoises dans les ruines de Kilwa.',
            sw: 'Dhahabu ilitoka Sofala na Zimbabwe Kuu, pembe za ndovu kutoka bara. Badala yake, Kilwa ilipokea vitambaa vya Uhindi, kauri za Uchina na shanga. Wanaakiolojia wamepata sarafu za Kichina katika magofu ya Kilwa.',
          },
          hints: [
            {
              fr: 'Pensez à ce que l’Afrique de l’intérieur produisait et que l’Asie n’avait pas en abondance. Un métal précieux, et une matière qui vient d’un grand animal.',
              sw: 'Fikirieni Afrika ya bara ilizalisha nini ambacho Asia haikuwa nacho kwa wingi. Madini ya thamani, na kitu kinachotoka kwa mnyama mkubwa.',
            },
            {
              fr: 'Le premier vient des mines de Sofala, au sud. Le second se sculpte en bijoux et en pièces d’échecs.',
              sw: 'Ya kwanza inatoka migodi ya Sofala, kusini. Ya pili inachongwa kuwa mapambo na vipande vya sataranji.',
            },
          ],
        },
        {
          id: 'h-wind',
          kind: 'ask_write',
          lookAt: 'slate',
          maxSeconds: 180,
          prompt: {
            fr: 'Les boutres partaient vers l’Inde à une saison et revenaient à l’autre, toujours poussés par le vent. Comment s’appelle ce vent qui change de sens deux fois par an ? Écrivez son nom et dessinez deux flèches sur votre carte.',
            sw: 'Majahazi yalienda Uhindi msimu mmoja na kurudi msimu mwingine, yakisukumwa na upepo. Upepo huu unaobadilisha mwelekeo mara mbili kwa mwaka unaitwaje? Andikeni jina lake na mchore mishale miwili kwenye ramani yenu.',
          },
          expected: { fr: 'la mousson', sw: 'monsuni' },
          accept: ['mousson', 'monsuni', 'kaskazi', 'kusi', 'kaskazi na kusi'],
          rubric: {
            fr: 'Accepter « mousson », ou les noms swahilis des deux vents : kaskazi (nord-est, de novembre à mars) et kusi (sud-ouest, d’avril à octobre). Féliciter si les flèches vont dans deux sens opposés.',
            sw: 'Kubali « monsuni », au majina ya Kiswahili ya pepo mbili: kaskazi (kaskazi-mashariki, Novemba hadi Machi) na kusi (kusini-magharibi, Aprili hadi Oktoba). Pongeza kama mishale inaelekea pande mbili tofauti.',
          },
          explanation: {
            fr: 'La mousson : le kaskazi souffle du nord-est de novembre à mars et amène les boutres d’Arabie et d’Inde. Le kusi souffle du sud-ouest d’avril à octobre et les ramène chez eux. Les marchands restaient donc des mois à Kilwa, et les langues et les cuisines se sont mélangées.',
            sw: 'Monsuni: kaskazi huvuma kutoka kaskazi-mashariki Novemba hadi Machi na kuleta majahazi kutoka Uarabuni na Uhindi. Kusi huvuma kutoka kusini-magharibi Aprili hadi Oktoba na kuyarudisha. Wafanyabiashara walikaa miezi Kilwa, na lugha na vyakula vikachanganyika.',
          },
          hints: [
            {
              fr: 'Ce vent a donné son nom aux pluies d’été en Inde. En swahili, ses deux sens s’appellent kaskazi et kusi.',
              sw: 'Upepo huu umeipa jina mvua za kiangazi Uhindi. Kwa Kiswahili pande zake mbili zinaitwa kaskazi na kusi.',
            },
          ],
        },
        {
          id: 'h-discuss',
          kind: 'discuss',
          lookAt: 'students',
          hints: [],
          prompt: {
            fr: 'Regardez votre carte : l’île, l’or au sud, l’Inde à l’est, les deux flèches du vent. Pourquoi Kilwa, une petite île sans grande armée, est-elle devenue si riche ? Préparez une réponse d’une minute pour le Grand Conseil.',
            sw: 'Angalieni ramani yenu: kisiwa, dhahabu kusini, Uhindi mashariki, mishale miwili ya upepo. Kwa nini Kilwa, kisiwa kidogo bila jeshi kubwa, ilitajirika hivyo? Andaeni jibu la dakika moja kwa Baraza Kuu.',
          },
        },
      ],
    },
  ],
  plenary: {
    title: { fr: 'Le Grand Conseil du sultan', sw: 'Baraza Kuu la Sultani' },
    description: {
      fr: 'Chaque groupe apporte une pièce du puzzle : la mesure juste, la parole juste, la route juste. Ensemble, ils répondent à la question du sultan.',
      sw: 'Kila kikundi kinaleta kipande cha fumbo: kipimo cha haki, neno la haki, njia ya haki. Pamoja wanajibu swali la sultani.',
    },
    finalPrompt: {
      fr: 'Orateurs, levez-vous. En une minute chacun : qu’est-ce que votre atelier a découvert sur ce qui rend un marché, et une ville, justes et prospères ?',
      sw: 'Wasemaji, simameni. Kwa dakika moja kila mmoja: warsha yenu imegundua nini kuhusu kinachofanya soko, na mji, kuwa vya haki na vyenye ustawi?',
    },
  },
};
