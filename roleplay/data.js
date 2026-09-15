export function getOptions(nameHe, nameShe) { return {

  male: [
    "director executiv rămas peste program",
    "vecin nou mutat în clădire",
    "soț care ajunge târziu acasă",
    "bărbat misterios venit pentru o întâlnire",
    "arhitect care lucrează la un proiect urgent",
    "fotograf invitat pentru o ședință privată",
    "antreprenor stresat după o zi lungă",
    "antrenor personal care a rămas după ședință",
    "profesor universitar într-o vizită discretă",
    "prieten vechi reîntâlnit după ani",
    "barman care a închis localul mai devreme",
    "avocat care a venit pentru o discuție serioasă",
    "medic care a trecut să verifice ceva important",
    "consultant financiar într-o întâlnire privată",
    "proprietar al apartamentului închiriat recent"
  ],

  female: [
    "secretară care rămâne ultima în birou",
    "vecină care bate la ușă cu un pretext",
    "soție care pregătește o surpriză",
    "artistă care lucrează la un tablou",
    "femeie care caută un document pierdut",
    "gazdă a unei seri aparent liniștite",
    "manager de proiect într-o întâlnire discretă",
    "clientă misterioasă care a cerut o întâlnire privată",
    "prietena care nu a mai dat niciun semn de luni",
    "colegă care vrea să clarifice ceva personal",
    "dansatoare care a rămas după repetiții",
    "avocată într-o discuție confidențială",
    "femeie care pretinde că a greșit adresa",
    "asistentă medicală care a trecut în vizită",
    "scriitoare care caută inspirație"
  ],

  location: [
    "apartamentul vostru, seara târziu",
    "bucătăria luminată doar de veioză",
    "livingul într-o seară ploioasă",
    "dormitorul după o zi obositoare",
    "biroul de acasă, după program",
    "canapeaua din living, într-o liniște apăsătoare",
    "balconul cu orașul luminat în fundal",
    "holul blocului aproape de miezul nopții",
    "un hotel discret din centrul orașului",
    "o cameră de hotel în timpul unei conferințe",
    "un studio foto luminat difuz",
    "o sală de ședințe rămasă goală",
    "o terasă privată la ultimul etaj",
    "o casă de vacanță într-o seară liniștită",
    "garajul slab luminat al clădirii"
  ],

  object: [
    "telefonul lăsat pe masă",
    "cheile căzute pe podea",
    "o oglindă care reflectă totul",
    "un pahar cu vin",
    "o fotografie veche găsită într-un sertar",
    "lumina stinsă brusc",
    "o cămașă aruncată pe spătarul scaunului",
    "un mesaj apărut pe ecran",
    "o brățară uitată pe noptieră",
    "un contract rămas deschis pe birou",
    "o lumânare care pâlpâie",
    "o sticlă de parfum lăsată deschisă",
    "o fereastră întredeschisă",
    "o ușă care se închide lent",
    "o veioză care proiectează umbre"
  ],

  control: [
    `${nameShe} conduce scena`,
    `${nameHe} conduce scena`,
    "Echilibru perfect",
    `${nameShe} preia controlul subtil`,
    `${nameHe} domină fără grabă`
  ]
}; }

export function buildStory(selections, nameHe, nameShe) {
  let dynamicPart = "";

  if (selections.control === `${nameShe} conduce scena`) {

    dynamicPart = `
${nameShe} nu mai joacă un rol.
Își asumă controlul cu o siguranță care îl face să încremenească.

Îi prinde cămașa în pumni și îl trage aproape,
suficient cât să-i simtă căldura prin material.

Respirațiile se amestecă.
Privirile nu mai sunt inocente.

„Te uiți prea mult.”
Tonul ei nu tremură.

Îl împinge lent înapoi,
nu ca să se îndepărteze,
ci ca să-i arate că ea decide ritmul.

Mâinile ei nu ezită.
Îi simte reacția.
Și știe exact ce face.
`;

  } else if (selections.control === `${nameHe} conduce scena`) {

    dynamicPart = `
${nameHe} nu cere permisiune.
Reduce distanța până când spațiul dintre voi dispare complet.

Îi cuprinde talia ferm,
degetele lui rămânând acolo,
deliberat.

„Nu te mișca.”
Vocea lui e joasă.
Sigură.

Îi urmărește fiecare reacție.
Fiecare schimbare de respirație.

Nu grăbește nimic.
Pentru că știe că anticiparea e mai intensă decât orice gest brusc.

Controlul nu e agresiv.
E calculat.
Și extrem de clar.
`;

  } else {

    dynamicPart = `
Niciunul nu face primul pas.
Și tocmai asta devine provocarea.

${nameShe} își mușcă ușor buza,
menținând contactul vizual mai mult decât ar trebui.

${nameHe} nu cedează.
Dar nici nu pleacă.

Un pas înainte.
Un centimetru prea aproape.

Tensiunea devine electrică.
Un duel tăcut,
în care fiecare respirație contează.
`;
  }

  const story = `
${nameShe}, în rolul de ${selections.female},
se află în ${selections.location}.

Lumina e difuză.
Umbrele joacă pe pereți.
Atmosfera nu mai e neutră.

${nameHe}, ca ${selections.male}, intră.
Privirea lui rămâne fixată prea mult timp.

Distanța dintre voi scade.
Încet.
Deliberat.

Nu mai e o simplă conversație.
E o apropiere controlată.

E despre cine face următorul gest.
E despre cine cedează primul.

${dynamicPart}

${selections.object} rămâne undeva în fundal.
Uit at.
Irelevant.

Pentru că acum,
tot ce contează
este tensiunea dintre voi.
`;

  return story.trim();
}
