// WM 2026 Panini Sticker Album - Vollständige Stickerliste
// Gastgeberländer: USA, Kanada, Mexiko | 48 Teams, 12 Gruppen

const WM2026_SECTIONS = [
  {
    id: "intro",
    name: "Einleitung",
    emoji: "🏆",
    stickers: [
      { nr: 1, name: "Offizielles Cover WM 2026", special: true },
      { nr: 2, name: "FIFA WM Trophäe", special: true },
      { nr: 3, name: "Offizielles Maskottchen", special: true },
      { nr: 4, name: "USA – Gastgeberland", special: true },
      { nr: 5, name: "Kanada – Gastgeberland", special: true },
      { nr: 6, name: "Mexiko – Gastgeberland", special: true },
      { nr: 7, name: "Stadion: MetLife Stadium (New York)", special: true },
      { nr: 8, name: "Stadion: SoFi Stadium (Los Angeles)", special: true },
      { nr: 9, name: "Stadion: AT&T Stadium (Dallas)", special: true },
      { nr: 10, name: "Stadion: Hard Rock Stadium (Miami)", special: true },
      { nr: 11, name: "Stadion: BC Place (Vancouver)", special: true },
      { nr: 12, name: "Stadion: BMO Field (Toronto)", special: true },
      { nr: 13, name: "Stadion: Estadio Azteca (Mexiko-Stadt)", special: true },
      { nr: 14, name: "Stadion: Estadio BBVA (Monterrey)", special: true },
      { nr: 15, name: "Offizieller Spielball", special: true },
      { nr: 16, name: "WM-Eröffnungszeremonie", special: true },
      { nr: 17, name: "FIFA Präsident", special: true },
      { nr: 18, name: "WM 2026 Logo Glitzer", special: true },
    ],
  },
  {
    id: "gruppeA",
    name: "Gruppe A",
    emoji: "🇺🇸",
    teams: [
      {
        name: "USA",
        flag: "🇺🇸",
        stickers: [
          { nr: 19, name: "USA – Teamfoto" },
          { nr: 20, name: "USA – Trikot" },
          { nr: 21, name: "Christian Pulisic" },
          { nr: 22, name: "Tyler Adams" },
          { nr: 23, name: "Weston McKennie" },
          { nr: 24, name: "Matt Turner" },
        ],
      },
      {
        name: "Kanada",
        flag: "🇨🇦",
        stickers: [
          { nr: 25, name: "Kanada – Teamfoto" },
          { nr: 26, name: "Kanada – Trikot" },
          { nr: 27, name: "Alphonso Davies" },
          { nr: 28, name: "Jonathan David" },
          { nr: 29, name: "Tajon Buchanan" },
          { nr: 30, name: "Milan Borjan" },
        ],
      },
      {
        name: "Mexiko",
        flag: "🇲🇽",
        stickers: [
          { nr: 31, name: "Mexiko – Teamfoto" },
          { nr: 32, name: "Mexiko – Trikot" },
          { nr: 33, name: "Hirving Lozano" },
          { nr: 34, name: "Raúl Jiménez" },
          { nr: 35, name: "Edson Álvarez" },
          { nr: 36, name: "Guillermo Ochoa" },
        ],
      },
      {
        name: "Uruguay",
        flag: "🇺🇾",
        stickers: [
          { nr: 37, name: "Uruguay – Teamfoto" },
          { nr: 38, name: "Uruguay – Trikot" },
          { nr: 39, name: "Federico Valverde" },
          { nr: 40, name: "Darwin Núñez" },
          { nr: 41, name: "Ronald Araújo" },
          { nr: 42, name: "José María Giménez" },
        ],
      },
    ],
  },
  {
    id: "gruppeB",
    name: "Gruppe B",
    emoji: "🇩🇪",
    teams: [
      {
        name: "Deutschland",
        flag: "🇩🇪",
        stickers: [
          { nr: 43, name: "Deutschland – Teamfoto" },
          { nr: 44, name: "Deutschland – Trikot" },
          { nr: 45, name: "Jamal Musiala" },
          { nr: 46, name: "Florian Wirtz" },
          { nr: 47, name: "Joshua Kimmich" },
          { nr: 48, name: "Manuel Neuer" },
        ],
      },
      {
        name: "Spanien",
        flag: "🇪🇸",
        stickers: [
          { nr: 49, name: "Spanien – Teamfoto" },
          { nr: 50, name: "Spanien – Trikot" },
          { nr: 51, name: "Pedri" },
          { nr: 52, name: "Lamine Yamal" },
          { nr: 53, name: "Rodri" },
          { nr: 54, name: "Unai Simón" },
        ],
      },
      {
        name: "Japan",
        flag: "🇯🇵",
        stickers: [
          { nr: 55, name: "Japan – Teamfoto" },
          { nr: 56, name: "Japan – Trikot" },
          { nr: 57, name: "Takumi Minamino" },
          { nr: 58, name: "Ritsu Doan" },
          { nr: 59, name: "Wataru Endo" },
          { nr: 60, name: "Shuichi Gonda" },
        ],
      },
      {
        name: "Senegal",
        flag: "🇸🇳",
        stickers: [
          { nr: 61, name: "Senegal – Teamfoto" },
          { nr: 62, name: "Senegal – Trikot" },
          { nr: 63, name: "Sadio Mané" },
          { nr: 64, name: "Kalidou Koulibaly" },
          { nr: 65, name: "Idrissa Gueye" },
          { nr: 66, name: "Édouard Mendy" },
        ],
      },
    ],
  },
  {
    id: "gruppeC",
    name: "Gruppe C",
    emoji: "🇫🇷",
    teams: [
      {
        name: "Frankreich",
        flag: "🇫🇷",
        stickers: [
          { nr: 67, name: "Frankreich – Teamfoto" },
          { nr: 68, name: "Frankreich – Trikot" },
          { nr: 69, name: "Kylian Mbappé" },
          { nr: 70, name: "Antoine Griezmann" },
          { nr: 71, name: "Aurélien Tchouaméni" },
          { nr: 72, name: "Mike Maignan" },
        ],
      },
      {
        name: "Brasilien",
        flag: "🇧🇷",
        stickers: [
          { nr: 73, name: "Brasilien – Teamfoto" },
          { nr: 74, name: "Brasilien – Trikot" },
          { nr: 75, name: "Vinícius Jr." },
          { nr: 76, name: "Rodrygo" },
          { nr: 77, name: "Casemiro" },
          { nr: 78, name: "Alisson Becker" },
        ],
      },
      {
        name: "Nigeria",
        flag: "🇳🇬",
        stickers: [
          { nr: 79, name: "Nigeria – Teamfoto" },
          { nr: 80, name: "Nigeria – Trikot" },
          { nr: 81, name: "Victor Osimhen" },
          { nr: 82, name: "Wilfried Ndidi" },
          { nr: 83, name: "Alex Iwobi" },
          { nr: 84, name: "Francis Uzoho" },
        ],
      },
      {
        name: "Südkorea",
        flag: "🇰🇷",
        stickers: [
          { nr: 85, name: "Südkorea – Teamfoto" },
          { nr: 86, name: "Südkorea – Trikot" },
          { nr: 87, name: "Son Heung-min" },
          { nr: 88, name: "Lee Jae-sung" },
          { nr: 89, name: "Kim Min-jae" },
          { nr: 90, name: "Jo Hyeon-woo" },
        ],
      },
    ],
  },
  {
    id: "gruppeD",
    name: "Gruppe D",
    emoji: "🇵🇹",
    teams: [
      {
        name: "Portugal",
        flag: "🇵🇹",
        stickers: [
          { nr: 91, name: "Portugal – Teamfoto" },
          { nr: 92, name: "Portugal – Trikot" },
          { nr: 93, name: "Cristiano Ronaldo" },
          { nr: 94, name: "Bruno Fernandes" },
          { nr: 95, name: "Rúben Dias" },
          { nr: 96, name: "Diogo Costa" },
        ],
      },
      {
        name: "England",
        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        stickers: [
          { nr: 97, name: "England – Teamfoto" },
          { nr: 98, name: "England – Trikot" },
          { nr: 99, name: "Jude Bellingham" },
          { nr: 100, name: "Phil Foden" },
          { nr: 101, name: "Declan Rice" },
          { nr: 102, name: "Jordan Pickford" },
        ],
      },
      {
        name: "Argentinien",
        flag: "🇦🇷",
        stickers: [
          { nr: 103, name: "Argentinien – Teamfoto" },
          { nr: 104, name: "Argentinien – Trikot" },
          { nr: 105, name: "Lionel Messi" },
          { nr: 106, name: "Julian Alvarez" },
          { nr: 107, name: "Rodrigo De Paul" },
          { nr: 108, name: "Emiliano Martínez" },
        ],
      },
      {
        name: "Marokko",
        flag: "🇲🇦",
        stickers: [
          { nr: 109, name: "Marokko – Teamfoto" },
          { nr: 110, name: "Marokko – Trikot" },
          { nr: 111, name: "Achraf Hakimi" },
          { nr: 112, name: "Hakim Ziyech" },
          { nr: 113, name: "Romain Saïss" },
          { nr: 114, name: "Yassine Bounou" },
        ],
      },
    ],
  },
  {
    id: "gruppeE",
    name: "Gruppe E",
    emoji: "🇳🇱",
    teams: [
      {
        name: "Niederlande",
        flag: "🇳🇱",
        stickers: [
          { nr: 115, name: "Niederlande – Teamfoto" },
          { nr: 116, name: "Niederlande – Trikot" },
          { nr: 117, name: "Cody Gakpo" },
          { nr: 118, name: "Virgil van Dijk" },
          { nr: 119, name: "Frenkie de Jong" },
          { nr: 120, name: "Bart Verbruggen" },
        ],
      },
      {
        name: "Belgien",
        flag: "🇧🇪",
        stickers: [
          { nr: 121, name: "Belgien – Teamfoto" },
          { nr: 122, name: "Belgien – Trikot" },
          { nr: 123, name: "Kevin De Bruyne" },
          { nr: 124, name: "Romelu Lukaku" },
          { nr: 125, name: "Axel Witsel" },
          { nr: 126, name: "Thibaut Courtois" },
        ],
      },
      {
        name: "Kolumbien",
        flag: "🇨🇴",
        stickers: [
          { nr: 127, name: "Kolumbien – Teamfoto" },
          { nr: 128, name: "Kolumbien – Trikot" },
          { nr: 129, name: "James Rodríguez" },
          { nr: 130, name: "Luis Díaz" },
          { nr: 131, name: "Falcao García" },
          { nr: 132, name: "David Ospina" },
        ],
      },
      {
        name: "Ecuador",
        flag: "🇪🇨",
        stickers: [
          { nr: 133, name: "Ecuador – Teamfoto" },
          { nr: 134, name: "Ecuador – Trikot" },
          { nr: 135, name: "Enner Valencia" },
          { nr: 136, name: "Moisés Caicedo" },
          { nr: 137, name: "Piero Hincapié" },
          { nr: 138, name: "Alexander Domínguez" },
        ],
      },
    ],
  },
  {
    id: "gruppeF",
    name: "Gruppe F",
    emoji: "🇭🇷",
    teams: [
      {
        name: "Kroatien",
        flag: "🇭🇷",
        stickers: [
          { nr: 139, name: "Kroatien – Teamfoto" },
          { nr: 140, name: "Kroatien – Trikot" },
          { nr: 141, name: "Luka Modrić" },
          { nr: 142, name: "Ivan Perišić" },
          { nr: 143, name: "Marcelo Brozović" },
          { nr: 144, name: "Dominik Livaković" },
        ],
      },
      {
        name: "Dänemark",
        flag: "🇩🇰",
        stickers: [
          { nr: 145, name: "Dänemark – Teamfoto" },
          { nr: 146, name: "Dänemark – Trikot" },
          { nr: 147, name: "Christian Eriksen" },
          { nr: 148, name: "Pierre-Emile Højbjerg" },
          { nr: 149, name: "Andreas Christensen" },
          { nr: 150, name: "Kasper Schmeichel" },
        ],
      },
      {
        name: "Australien",
        flag: "🇦🇺",
        stickers: [
          { nr: 151, name: "Australien – Teamfoto" },
          { nr: 152, name: "Australien – Trikot" },
          { nr: 153, name: "Mathew Leckie" },
          { nr: 154, name: "Martin Boyle" },
          { nr: 155, name: "Aaron Mooy" },
          { nr: 156, name: "Mat Ryan" },
        ],
      },
      {
        name: "Tunesien",
        flag: "🇹🇳",
        stickers: [
          { nr: 157, name: "Tunesien – Teamfoto" },
          { nr: 158, name: "Tunesien – Trikot" },
          { nr: 159, name: "Youssef Msakni" },
          { nr: 160, name: "Wahbi Khazri" },
          { nr: 161, name: "Mohamed Draeger" },
          { nr: 162, name: "Aymen Dahmen" },
        ],
      },
    ],
  },
  {
    id: "gruppeG",
    name: "Gruppe G",
    emoji: "🇨🇭",
    teams: [
      {
        name: "Schweiz",
        flag: "🇨🇭",
        stickers: [
          { nr: 163, name: "Schweiz – Teamfoto" },
          { nr: 164, name: "Schweiz – Trikot" },
          { nr: 165, name: "Xherdan Shaqiri" },
          { nr: 166, name: "Granit Xhaka" },
          { nr: 167, name: "Manuel Akanji" },
          { nr: 168, name: "Yann Sommer" },
        ],
      },
      {
        name: "Österreich",
        flag: "🇦🇹",
        stickers: [
          { nr: 169, name: "Österreich – Teamfoto" },
          { nr: 170, name: "Österreich – Trikot" },
          { nr: 171, name: "David Alaba" },
          { nr: 172, name: "Marcel Sabitzer" },
          { nr: 173, name: "Marko Arnautović" },
          { nr: 174, name: "Patrick Pentz" },
        ],
      },
      {
        name: "Saudi-Arabien",
        flag: "🇸🇦",
        stickers: [
          { nr: 175, name: "Saudi-Arabien – Teamfoto" },
          { nr: 176, name: "Saudi-Arabien – Trikot" },
          { nr: 177, name: "Salem Al-Dawsari" },
          { nr: 178, name: "Mohammed Al-Owais" },
          { nr: 179, name: "Saleh Al-Shehri" },
          { nr: 180, name: "Feras Al-Brikan" },
        ],
      },
      {
        name: "Ghana",
        flag: "🇬🇭",
        stickers: [
          { nr: 181, name: "Ghana – Teamfoto" },
          { nr: 182, name: "Ghana – Trikot" },
          { nr: 183, name: "André Ayew" },
          { nr: 184, name: "Thomas Partey" },
          { nr: 185, name: "Jordan Ayew" },
          { nr: 186, name: "Lawrence Ati-Zigi" },
        ],
      },
    ],
  },
  {
    id: "gruppeH",
    name: "Gruppe H",
    emoji: "🇵🇱",
    teams: [
      {
        name: "Polen",
        flag: "🇵🇱",
        stickers: [
          { nr: 187, name: "Polen – Teamfoto" },
          { nr: 188, name: "Polen – Trikot" },
          { nr: 189, name: "Robert Lewandowski" },
          { nr: 190, name: "Piotr Zieliński" },
          { nr: 191, name: "Grzegorz Krychowiak" },
          { nr: 192, name: "Wojciech Szczęsny" },
        ],
      },
      {
        name: "Serbien",
        flag: "🇷🇸",
        stickers: [
          { nr: 193, name: "Serbien – Teamfoto" },
          { nr: 194, name: "Serbien – Trikot" },
          { nr: 195, name: "Aleksandar Mitrović" },
          { nr: 196, name: "Dušan Tadić" },
          { nr: 197, name: "Nemanja Gudelj" },
          { nr: 198, name: "Vanja Milinković-Savić" },
        ],
      },
      {
        name: "Elfenbeinküste",
        flag: "🇨🇮",
        stickers: [
          { nr: 199, name: "Elfenbeinküste – Teamfoto" },
          { nr: 200, name: "Elfenbeinküste – Trikot" },
          { nr: 201, name: "Sébastien Haller" },
          { nr: 202, name: "Franck Kessié" },
          { nr: 203, name: "Serge Aurier" },
          { nr: 204, name: "Sangare Oumar" },
        ],
      },
      {
        name: "Iran",
        flag: "🇮🇷",
        stickers: [
          { nr: 205, name: "Iran – Teamfoto" },
          { nr: 206, name: "Iran – Trikot" },
          { nr: 207, name: "Mehdi Taremi" },
          { nr: 208, name: "Sardar Azmoun" },
          { nr: 209, name: "Ali Gholizadeh" },
          { nr: 210, name: "Alireza Beiranvand" },
        ],
      },
    ],
  },
  {
    id: "gruppeI",
    name: "Gruppe I",
    emoji: "🇵🇾",
    teams: [
      {
        name: "Paraguay",
        flag: "🇵🇾",
        stickers: [
          { nr: 211, name: "Paraguay – Teamfoto" },
          { nr: 212, name: "Paraguay – Trikot" },
          { nr: 213, name: "Miguel Almirón" },
          { nr: 214, name: "Andrés Cubas" },
          { nr: 215, name: "Junior Alonso" },
          { nr: 216, name: "Antony Silva" },
        ],
      },
      {
        name: "Türkei",
        flag: "🇹🇷",
        stickers: [
          { nr: 217, name: "Türkei – Teamfoto" },
          { nr: 218, name: "Türkei – Trikot" },
          { nr: 219, name: "Hakan Çalhanoğlu" },
          { nr: 220, name: "Arda Güler" },
          { nr: 221, name: "Merih Demiral" },
          { nr: 222, name: "Mert Günok" },
        ],
      },
      {
        name: "Rumänien",
        flag: "🇷🇴",
        stickers: [
          { nr: 223, name: "Rumänien – Teamfoto" },
          { nr: 224, name: "Rumänien – Trikot" },
          { nr: 225, name: "Nicolae Stanciu" },
          { nr: 226, name: "Ianis Hagi" },
          { nr: 227, name: "Radu Drăgușin" },
          { nr: 228, name: "Florin Niță" },
        ],
      },
      {
        name: "Kamerun",
        flag: "🇨🇲",
        stickers: [
          { nr: 229, name: "Kamerun – Teamfoto" },
          { nr: 230, name: "Kamerun – Trikot" },
          { nr: 231, name: "Vincent Aboubakar" },
          { nr: 232, name: "André-Frank Zambo Anguissa" },
          { nr: 233, name: "Collins Fai" },
          { nr: 234, name: "Devis Epassy" },
        ],
      },
    ],
  },
  {
    id: "gruppeJ",
    name: "Gruppe J",
    emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    teams: [
      {
        name: "Schottland",
        flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        stickers: [
          { nr: 235, name: "Schottland – Teamfoto" },
          { nr: 236, name: "Schottland – Trikot" },
          { nr: 237, name: "Andy Robertson" },
          { nr: 238, name: "Scott McTominay" },
          { nr: 239, name: "Che Adams" },
          { nr: 240, name: "Angus Gunn" },
        ],
      },
      {
        name: "Portugal II (Qualif.)",
        flag: "🇵🇹",
        stickers: [
          { nr: 241, name: "Venezuela – Teamfoto" },
          { nr: 242, name: "Venezuela – Trikot" },
          { nr: 243, name: "Jhon Murillo" },
          { nr: 244, name: "Yangel Herrera" },
          { nr: 245, name: "Ronald Hernández" },
          { nr: 246, name: "Wuilker Fariñez" },
        ],
      },
      {
        name: "Ungarn",
        flag: "🇭🇺",
        stickers: [
          { nr: 247, name: "Ungarn – Teamfoto" },
          { nr: 248, name: "Ungarn – Trikot" },
          { nr: 249, name: "Dominik Szoboszlai" },
          { nr: 250, name: "Roland Sallai" },
          { nr: 251, name: "Willi Orbán" },
          { nr: 252, name: "Péter Gulácsi" },
        ],
      },
      {
        name: "Ägypten",
        flag: "🇪🇬",
        stickers: [
          { nr: 253, name: "Ägypten – Teamfoto" },
          { nr: 254, name: "Ägypten – Trikot" },
          { nr: 255, name: "Mohamed Salah" },
          { nr: 256, name: "Mohamed Elneny" },
          { nr: 257, name: "Trezeguet" },
          { nr: 258, name: "Mohamed El-Shennawy" },
        ],
      },
    ],
  },
  {
    id: "gruppeK",
    name: "Gruppe K",
    emoji: "🇵🇪",
    teams: [
      {
        name: "Peru",
        flag: "🇵🇪",
        stickers: [
          { nr: 259, name: "Peru – Teamfoto" },
          { nr: 260, name: "Peru – Trikot" },
          { nr: 261, name: "Paolo Guerrero" },
          { nr: 262, name: "André Carrillo" },
          { nr: 263, name: "Christian Cueva" },
          { nr: 264, name: "Pedro Gallese" },
        ],
      },
      {
        name: "Tschechien",
        flag: "🇨🇿",
        stickers: [
          { nr: 265, name: "Tschechien – Teamfoto" },
          { nr: 266, name: "Tschechien – Trikot" },
          { nr: 267, name: "Tomáš Souček" },
          { nr: 268, name: "Patrik Schick" },
          { nr: 269, name: "Vladimír Coufal" },
          { nr: 270, name: "Jiří Pavlenka" },
        ],
      },
      {
        name: "Algerien",
        flag: "🇩🇿",
        stickers: [
          { nr: 271, name: "Algerien – Teamfoto" },
          { nr: 272, name: "Algerien – Trikot" },
          { nr: 273, name: "Riyad Mahrez" },
          { nr: 274, name: "Islam Slimani" },
          { nr: 275, name: "Ismaël Bennacer" },
          { nr: 276, name: "Raïs M'Bolhi" },
        ],
      },
      {
        name: "Costa Rica",
        flag: "🇨🇷",
        stickers: [
          { nr: 277, name: "Costa Rica – Teamfoto" },
          { nr: 278, name: "Costa Rica – Trikot" },
          { nr: 279, name: "Bryan Ruiz" },
          { nr: 280, name: "Joel Campbell" },
          { nr: 281, name: "Celso Borges" },
          { nr: 282, name: "Keylor Navas" },
        ],
      },
    ],
  },
  {
    id: "gruppeL",
    name: "Gruppe L",
    emoji: "🇬🇷",
    teams: [
      {
        name: "Griechenland",
        flag: "🇬🇷",
        stickers: [
          { nr: 283, name: "Griechenland – Teamfoto" },
          { nr: 284, name: "Griechenland – Trikot" },
          { nr: 285, name: "Kostas Tsimikas" },
          { nr: 286, name: "Anastasios Bakasetas" },
          { nr: 287, name: "Giorgos Masouras" },
          { nr: 288, name: "Odysseas Vlachodimos" },
        ],
      },
      {
        name: "Chile",
        flag: "🇨🇱",
        stickers: [
          { nr: 289, name: "Chile – Teamfoto" },
          { nr: 290, name: "Chile – Trikot" },
          { nr: 291, name: "Alexis Sánchez" },
          { nr: 292, name: "Arturo Vidal" },
          { nr: 293, name: "Charles Aránguiz" },
          { nr: 294, name: "Claudio Bravo" },
        ],
      },
      {
        name: "Irak",
        flag: "🇮🇶",
        stickers: [
          { nr: 295, name: "Irak – Teamfoto" },
          { nr: 296, name: "Irak – Trikot" },
          { nr: 297, name: "Mohanad Ali" },
          { nr: 298, name: "Amjad Attwan" },
          { nr: 299, name: "Saad Abdul Amir" },
          { nr: 300, name: "Jalal Hassan" },
        ],
      },
      {
        name: "Neuseeland",
        flag: "🇳🇿",
        stickers: [
          { nr: 301, name: "Neuseeland – Teamfoto" },
          { nr: 302, name: "Neuseeland – Trikot" },
          { nr: 303, name: "Chris Wood" },
          { nr: 304, name: "Liberato Cacace" },
          { nr: 305, name: "Winston Reid" },
          { nr: 306, name: "Stefan Marinovic" },
        ],
      },
    ],
  },
  {
    id: "stars",
    name: "Star-Sticker",
    emoji: "⭐",
    stickers: [
      { nr: 307, name: "Messi – Glitzer ⭐", special: true },
      { nr: 308, name: "Ronaldo – Glitzer ⭐", special: true },
      { nr: 309, name: "Mbappé – Glitzer ⭐", special: true },
      { nr: 310, name: "Bellingham – Glitzer ⭐", special: true },
      { nr: 311, name: "Vinícius Jr. – Glitzer ⭐", special: true },
      { nr: 312, name: "Pedri – Glitzer ⭐", special: true },
      { nr: 313, name: "Musiala – Glitzer ⭐", special: true },
      { nr: 314, name: "Yamal – Glitzer ⭐", special: true },
      { nr: 315, name: "Osimhen – Glitzer ⭐", special: true },
      { nr: 316, name: "Davies – Glitzer ⭐", special: true },
      { nr: 317, name: "De Bruyne – Glitzer ⭐", special: true },
      { nr: 318, name: "Modrić – Glitzer ⭐", special: true },
      { nr: 319, name: "Son – Glitzer ⭐", special: true },
      { nr: 320, name: "Szoboszlai – Glitzer ⭐", special: true },
      { nr: 321, name: "Valverde – Glitzer ⭐", special: true },
      { nr: 322, name: "Pulisic – Glitzer ⭐", special: true },
      { nr: 323, name: "Salah – Glitzer ⭐", special: true },
      { nr: 324, name: "Hakimi – Glitzer ⭐", special: true },
      { nr: 325, name: "Wirtz – Glitzer ⭐", special: true },
      { nr: 326, name: "Arda Güler – Glitzer ⭐", special: true },
    ],
  },
];

// Flache Liste aller Sticker mit Sektions-Referenz
function getAllStickers() {
  const all = [];
  for (const section of WM2026_SECTIONS) {
    if (section.stickers) {
      for (const s of section.stickers) {
        all.push({ ...s, sectionId: section.id, sectionName: section.name });
      }
    }
    if (section.teams) {
      for (const team of section.teams) {
        for (const s of team.stickers) {
          all.push({
            ...s,
            sectionId: section.id,
            sectionName: section.name,
            teamName: team.name,
            teamFlag: team.flag,
          });
        }
      }
    }
  }
  return all;
}
