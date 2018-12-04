import { newWindow } from 'Core/utilities';
import './Common.scss';

const a = { A: 'AAA' };
const b = { B: 'BBB' };
const ab = { ...a, ...b };

newWindow('https://www.cancer.gov');