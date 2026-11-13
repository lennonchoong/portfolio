export type Project = {
  title: string;
  description: string;
  images: {
    src: string;
    caption: string;
    hero?: boolean;
    scale?: number;
    /** on phones, images sharing this tag sit side by side (see CollageCanvas) */
    pair?: string;
    /** on phones, width as a % of the space available (see CollageCanvas) */
    phoneWidth?: number;
    /** within a phone pair, sit against the top or bottom of the row */
    phoneAlign?: "top" | "bottom";
    /** within a phone pair, push down by this % of the row width (stagger) */
    phoneOffsetY?: number;
    /** push the pair to opposite edges of its row on phones */
    phoneRowSpread?: boolean;
    /** minimum row height on phones, in vw (opens up the stagger) */
    phoneRowMinHeight?: number;
    /** on phones, order as if the cell sat at this vh (see CollageCanvas) */
    phoneOrder?: number;
  }[];
};

// Shared order for the projects button and project navigation.
export const PROJECTS: Project[] = [
{
        title: "Ode to the Modern Pilgrim",
        description:
          "We have an innate desire to shape the earth for our own, echoing our ancestral pilgrims’ relentless pursuit of innovation. Now, we are simply contemporary travellers, finding spaces we can control in a city so unforgiving to ownership of our environment. <br/><br/>My proposal pays tribute to the drive to transform the earth, through an adaptable tower that invites users to shape their environment - an exploration of the human condition. <br/><br/>The Earthwork theme invited me to engage with the site’s layered history—Roman tracks and ancient brick culverts. <br/><br/>Inspired by Roman engineers, the “Fathers of Trusses,” and Canterbury builders who raised cathedrals, I reflected on humanity’s timeless pursuit of progress and creation.",
        images: [
          { src: "/antecollage.png", caption: "", scale: 1.8 },
          { src: "/culv1.jpg", caption: "Wooden beam from Roman railway", scale: 0.85, pair: "roman", phoneWidth: 47, phoneAlign: "top" as const, phoneOrder: 28 },
          { src: "/culv2.jpg", caption: "Roman culvert", scale: 0.42, pair: "roman", phoneWidth: 47, phoneAlign: "bottom" as const, phoneRowSpread: true, phoneRowMinHeight: 76 },
          { src: "/mainante.png", caption: "Mhehehe", scale: 1.05 },
          { src: "/1.PNG", caption: "", pair: "sketches-a" },
          { src: "/2.PNG", caption: "", pair: "sketches-a" },
          { src: "/3.png", caption: "", pair: "sketches" },
          { src: "/4.png", caption: "", pair: "sketches" },
          { src: "/backrrender.png", caption: "", scale: 0.8 },
        ],
      },
{
        title: "Røyk — A Bergen Fish Market",
        description:
          "This market celebrates the art of smoking fish, a cultural practice revered in Bergen. The design aims to capture the beauty of communal dining and the magic of food preparation. The structure aspires to exist as a unique modern building among its historical surroundings while referencing the site’s vernacular architecture. It is centered around placemaking, inviting in the whole community.",
        images: [
          { src: "/undergif.gif", caption: "", hero: true },
          { src: "/siteplanberg2.jpg", caption: "", pair: "berg-site" },
          { src: "/vern3.png", caption: "", pair: "berg-site" },
          { src: "/harberg.jpg", caption: "", hero: true },
          { src: "/bergsketch.jpg", caption: "", phoneWidth: 70 },
          { src: "/model.png", caption: "" },
          { src: "/axo berg.jpg", caption: "" },
          { src: "/filletberg.jpg", caption: "" },
          { src: "/back berg.jpg", caption: "", hero: true, phoneOrder: 41 },
        ],
      },
{
        title: "Waters of Unfinished Maps: Reinscribing the Malacca Strait",
        description: `As a dedicated part 1...`,
        images: [
          { src: "/joelleprofile.jpg", caption: "" },
          { src: "/joelleprofile2.jpg", caption: "" },
        ],
      },
{
        title: "Peter Tatchell Foundation",
        description:
          "Peter Tatchell has dedicated his activist career to championing LGBTQIA+ rights through his foundation. The institution needs expanding, including an exhibition of his activism, a historical archive, and an office space.<br/><br/>The design aimed to embody queer identity—a monument standing boldly. It is a sanctuary for the LGBTQIA+ and an inclusive educational space for all. It is a statement of activism and a tribute to Tatchell’s unwavering dedication for a more equitable world.",
        images: [
          { src: "/bigsiteptf.png", caption: "Site — the King's Arms, Salford / Manchester", scale: 1.3 },
          { src: "/kingsarms.png", caption: "The existing King's Arms pub", scale: 0.5 },
          { src: "/kingsarms2.png", caption: "King's Arms — existing fabric", scale: 0.5 },
          { src: "/kingsarms3.png", caption: "King's Arms Ale House", scale: 0.5 },
          { src: "/sketchcompilation2.png", caption: "Initial sketches — 'squaring the circle'", scale: 1.2 },
          { src: "/diaptf.jpg", caption: "Concept — the visitor journey", scale: 0.85 },
          { src: "/ptfmodel.PNG", caption: "Site model" },
          { src: "/ptfgf.png", caption: "Ground floor plan", scale: 1.9 },
          { src: "/technical.jpg", caption: "Retrofit construction detail", scale: 1.2 },
          { src: "/joelle_warsono_portfolio_Page_13.jpg", caption: "Locally sourced stone — minimised emissions" },
          { src: "/highlevel.png", caption: "Aerial view in context" },
          { src: "/exhi.png", caption: "Exhibition space", scale: 1.45 },
          { src: "/officenew.png", caption: "Office space", scale: 2 },
          { src: "/roofrender.png", caption: "The monument in its greenspace" },
        ],
      },
{
        title: "Omah Mimpi",
        description: "My proposal envisions a cultural hub to revitalize traditional trade with a sustainable model. Drawing from behavioural economics and gamification theory, it integrates competition and reward through community building to engage participants, fostering motivation for achievement.",
        images: [
          { src: "/omah1.gif", caption: "" },
          { src: "/omah3.gif?v=2", caption: "", scale: 1.3 },
          { src: "/omah_weave1.png", caption: "", pair: "weave", phoneWidth: 60 },
          { src: "/omah_weave2.PNG", caption: "", pair: "weave", phoneWidth: 30 },
          { src: "/omah_ver1.png", caption: "", pair: "ver" },
          { src: "/omah_ver2.png", caption: "", pair: "ver" },
          { src: "/omah_plan.png", caption: "" },
          { src: "/diaomah.jpg", caption: "", scale: 1.8 },
        ],
      },
{
        title: "miscellaneous",
        description: "Main description for Cover.",
        images: [],
      }
];
