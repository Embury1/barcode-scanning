const db = require('./db.json');
const usb = require('usb');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pid = 34982;
const devices = usb.getDeviceList().filter(device => device.deviceDescriptor.idProduct === pid);

const device = devices[0];
device.open();

const interface = device.interfaces[0];
interface.claim();

const [ inEndpoint, outEndpoint ] = interface.endpoints;

rl.on('line', line => {
    if (/[0-9]{13}/.test(line)) {
        parse(line);
    }
});

inEndpoint.startPoll();
process.stdin.resume();

function parse(ean) {
    const companyPrefix = ean.slice(0, 7);
    const company = db.find(company => company.prefix === companyPrefix);

    if (!company) return console.error(`Company not found! ${companyPrefix}\n`);

    const serialNumber = ean.slice(-4, -1);
    const article = company.articles.find(article => article.serial === serialNumber);

    if (!article) return console.error(`Article not found! ${serialNumber}\n`);

    console.log(article.name);
}