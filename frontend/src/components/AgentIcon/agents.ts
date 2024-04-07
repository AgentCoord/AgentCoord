import AbigailChen from '@/static/AgentIcons/Abigail_Chen.png';
import AdamSmith from '@/static/AgentIcons/Adam_Smith.png';
import ArthurBurton from '@/static/AgentIcons/Arthur_Burton.png';
import AyeshaKhan from '@/static/AgentIcons/Ayesha_Khan.png';
import CarlosGomez from '@/static/AgentIcons/Carlos_Gomez.png';
import CarmenOrtiz from '@/static/AgentIcons/Carmen_Ortiz.png';
import EddyLin from '@/static/AgentIcons/Eddy_Lin.png';
import FranciscoLopez from '@/static/AgentIcons/Francisco_Lopez.png';
import GiorgioRossi from '@/static/AgentIcons/Giorgio_Rossi.png';
import HaileyJohnson from '@/static/AgentIcons/Hailey_Johnson.png';
import IsabellaRodriguez from '@/static/AgentIcons/Isabella_Rodriguez.png';
import JaneMoreno from '@/static/AgentIcons/Jane_Moreno.png';
import JenniferMoore from '@/static/AgentIcons/Jennifer_Moore.png';
import JohnLin from '@/static/AgentIcons/John_Lin.png';
import KlausMueller from '@/static/AgentIcons/Klaus_Mueller.png';
import LatoyaWilliams from '@/static/AgentIcons/Latoya_Williams.png';
import MariaLopez from '@/static/AgentIcons/Maria_Lopez.png';
import MeiLin from '@/static/AgentIcons/Mei_Lin.png';
import RajivPatel from '@/static/AgentIcons/Rajiv_Patel.png';
import RyanPark from '@/static/AgentIcons/Ryan_Park.png';
import SamMoore from '@/static/AgentIcons/Sam_Moore.png';
import TamaraTaylor from '@/static/AgentIcons/Tamara_Taylor.png';
import TomMoreno from '@/static/AgentIcons/Tom_Moreno.png';
import WolfgangSchulz from '@/static/AgentIcons/Wolfgang_Schulz.png';
import YurikoYamamoto from '@/static/AgentIcons/Yuriko_Yamamoto.png';
import Unknown from '@/static/AgentIcons/Unknow.png';

export enum IconName {
  AbigailChen = 'Abigail_Chen',
  AdamSmith = 'Adam_Smith',
  ArthurBurton = 'Arthur_Burton',
  AyeshaKhan = 'Ayesha_Khan',
  CarlosGomez = 'Carlos_Gomez',
  CarmenOrtiz = 'Carmen_Ortiz',
  EddyLin = 'Eddy_Lin',
  FranciscoLopez = 'Francisco_Lopez',
  CassandraSmith = 'Cassandra_Smith',
  ChristopherCarter = 'Christopher_Carter',
  DaveJones = 'Dave_Jones',
  DerekSmith = 'Derek_Smith',
  ElisaSmith = 'Elisa_Smith',
  EricJones = 'Eric_Jones',
  FayeSmith = 'Faye_Smith',
  FrankSmith = 'Frank_Smith',
  GabeSmith = 'Gabe_Smith',
  GiorgioRossi = 'Giorgio_Rossi',
  HaileyJohnson = 'Hailey_Johnson',
  IsabellaRodriguez = 'Isabella_Rodriguez',
  JaneMoreno = 'Jane_Moreno',
  JenniferMoore = 'Jennifer_Moore',
  JohnLin = 'John_Lin',
  KlausMueller = 'Klaus_Mueller',
  LatoyaWilliams = 'Latoya_Williams',
  MariaLopez = 'Maria_Lopez',
  MeiLin = 'Mei_Lin',
  RajivPatel = 'Rajiv_Patel',
  RyanPark = 'Ryan_Park',
  SamMoore = 'Sam_Moore',
  TamaraTaylor = 'Tamara_Taylor',
  TomMoreno = 'Tom_Moreno',
  WolfgangSchulz = 'Wolfgang_Schulz',
  YurikoYamamoto = 'Yuriko_Yamamoto',
  Unknown = 'Unknown',
}

const LowercaseNameMap: { [key: string]: IconName } = Object.fromEntries(
  Object.entries(IconName).map(([name, value]) => [name.toLowerCase(), value]),
);

export const IconMap = new Proxy<{ [key: string]: IconName }>(
  {},
  {
    get: (target, name) => {
      const lowerCaseName = name
        .toString()
        .toLowerCase()
        .replace(/[\s_]+/g, '');
      return LowercaseNameMap[lowerCaseName] || IconName.Unknown;
    },
  },
);

export const IconUrl: { [key in IconName]: string } = {
  [IconName.Unknown]: Unknown,
  [IconName.AbigailChen]: AbigailChen,
  [IconName.AdamSmith]: AdamSmith,
  [IconName.ArthurBurton]: ArthurBurton,
  [IconName.AyeshaKhan]: AyeshaKhan,
  [IconName.CarlosGomez]: CarlosGomez,
  [IconName.CarmenOrtiz]: CarmenOrtiz,
  [IconName.EddyLin]: EddyLin,
  [IconName.FranciscoLopez]: FranciscoLopez,
  [IconName.CassandraSmith]: AbigailChen,
  [IconName.ChristopherCarter]: AbigailChen,
  [IconName.DaveJones]: AbigailChen,
  [IconName.DerekSmith]: AbigailChen,
  [IconName.ElisaSmith]: AbigailChen,
  [IconName.EricJones]: AbigailChen,
  [IconName.FayeSmith]: AbigailChen,
  [IconName.FrankSmith]: AbigailChen,
  [IconName.GabeSmith]: AbigailChen,
  [IconName.GiorgioRossi]: GiorgioRossi,
  [IconName.HaileyJohnson]: HaileyJohnson,
  [IconName.IsabellaRodriguez]: IsabellaRodriguez,
  [IconName.JaneMoreno]: JaneMoreno,
  [IconName.JenniferMoore]: JenniferMoore,
  [IconName.JohnLin]: JohnLin,
  [IconName.KlausMueller]: KlausMueller,
  [IconName.LatoyaWilliams]: LatoyaWilliams,
  [IconName.MariaLopez]: MariaLopez,
  [IconName.MeiLin]: MeiLin,
  [IconName.RajivPatel]: RajivPatel,
  [IconName.RyanPark]: RyanPark,
  [IconName.SamMoore]: SamMoore,
  [IconName.TamaraTaylor]: TamaraTaylor,
  [IconName.TomMoreno]: TomMoreno,
  [IconName.WolfgangSchulz]: WolfgangSchulz,
  [IconName.YurikoYamamoto]: YurikoYamamoto,
};
