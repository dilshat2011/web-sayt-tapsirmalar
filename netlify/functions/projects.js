// Loyihalar ro'yxati
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

const projects = [
  { id: 1, icon: '🏗️', category: 'Infrastruktura', filter: 'infrastructure', name: "Kósheni rawajlandırıw", desc: "Shımbay rayonındaǵı tiykarǵı kóshelerdı zámanagóy órtewler menen tólewlew hám jarıtıw sistemasın keńeytiw.", votes: 312, maxVotes: 500, color: '#6C3FF5' },
  { id: 2, icon: '🌳', category: 'Ekologiya', filter: 'ecology', name: "Jasıl park qurıw", desc: "Nókis qalasında 2 gektarlıq aymaqta zámanagóy dem alıs bagın barpo etiw.", votes: 278, maxVotes: 500, color: '#22C55E' },
  { id: 3, icon: '📚', category: "Bilimlendiriw", filter: 'education', name: "Mektep kitebanasın modernizatsiyalaw", desc: "34-mektep kitebanasına zámanagóy kompyuterler, elektron resurslar hám jańa kitaplar qosıw.", votes: 445, maxVotes: 500, color: '#F59E0B' },
  { id: 4, icon: '🏥', category: "Sálametliklendiriw", filter: 'health', name: "Poliklinika abzallandırıw", desc: "5-qala poliklinikasına zámanagóy medicinlıq qurallar satıp alıw hám shipakerler shifasın asırıw.", votes: 389, maxVotes: 500, color: '#EF4444' },
  { id: 5, icon: '💧', category: 'Infrastruktura', filter: 'infrastructure', name: "Ishimilik suw sisteması", desc: "Beruniy rayonındaǵı 3 mahallede jańa suw taminatı qubırların salıw.", votes: 201, maxVotes: 500, color: '#00D2FF' },
  { id: 6, icon: '🎭', category: "Bilimlendiriw", filter: 'education', name: "Jaslar oraylın ashıw", desc: "Qońırat rayonında sport, óner hám texnologiya úyirmelerin ózinde jámlegen jaslar orayın tashkil etiw.", votes: 356, maxVotes: 500, color: '#8B63FF' }
];

exports.handler = async () => {
  return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: projects }) };
};
