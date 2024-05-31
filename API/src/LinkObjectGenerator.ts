import { Brand, LinkObject } from "./Entities"
import { Url, parse } from "url"
import { parse as parsetld } from 'tldts';
import puppeteer, { Browser, ConsoleMessage, HTTPRequest } from "puppeteer"
import dns, { promises } from 'dns';
import * as https from 'https';
import * as tls from 'tls';
import { DI } from "./server";
import { IncomingMessage } from "http";
export async function GenerateValidLinkObject(url : string, isMalicious : boolean) : Promise<LinkObject>{
    var obj : LinkObject = new LinkObject()
    var urlOBJ : URL = new URL(url)
    var dnsres = await dns.promises.resolve(urlOBJ.host)
    console.log(dnsres)
    if(dnsres[0] == undefined){
        console.log("no dns")
        return Promise.reject("invalid url")
    }
    obj.url = url
    obj.ip = dnsres[0]
    obj.length_url = url.length
    obj.length_hostname = GetHostnameLength(url)
    obj.nb_dots = url.split(".").length - 1
    obj.nb_hyphens = url.split("-").length - 1
    obj.nb_at = url.split("@").length - 1
    obj.nb_qm = url.split("?").length - 1
    obj.nb_and = url.split("&").length - 1
    obj.nb_or = url.split("|").length - 1
    obj.nb_eq = url.split("=").length - 1
    obj.nb_underscore = url.split("_").length - 1
    obj.nb_tilde = url.split("~").length - 1
    obj.nb_percent = url.split("%").length - 1
    obj.nb_slash = url.split("/").length - 1
    obj.nb_star = url.split("*").length - 1
    obj.nb_colon = url.split(":").length - 1
    obj.nb_comma = url.split(";").length - 1
    obj.nb_semicolumn = url.split(";").length - 1
    obj.nb_dollar = url.split("$").length - 1
    obj.nb_space = url.split(' ').length - 1
    obj.nb_www = url.split('www').length - 1
    obj.nb_com = url.split('com').length - 1
    obj.nb_dslash = url.split('//').length - 1
    obj.http_in_path = url.split('http').length - 2
    obj.https_token = url.split('https').length - 1
    obj.ratio_digits_url = digitRatio(url)
    obj.ratio_digits_host = digitRatio(GetHost(url))
    obj.punycode = containsPunycode(url)
    obj.port = url.startsWith("https://") ? 433 : 80
    obj.tld_in_path = containsTLD(urlOBJ.pathname)
    obj.tld_in_subdomain = containsTLD(getSubdomain(urlOBJ.host))
    var tldParsed = parsetld(url)
    if(tldParsed != null){
        obj.abnormal_subdomain = tldParsed.subdomain != "www" || "" ? 1 : 0
        obj.nb_subdomains = tldParsed.subdomain != null ? tldParsed.subdomain.split(".").length : 0
        obj.prefix_suffix = tldParsed.subdomain != "" && urlOBJ.pathname != "" ? 1 : 0
    }
    obj.path_extension = DoesHavePathExtension(urlOBJ)
    obj = await AnalyseWebpage(obj)
    obj = await SolveWords(obj)
    obj.domain_in_brand = await DoesContainBrand(urlOBJ.hostname)
    obj.brand_in_path = await DoesContainBrand(urlOBJ.pathname)
    obj.brand_in_subdomain = await DoesContainBrand(getSubdomain(url))
    obj.suspecious_tld = IsTLDSuspicious(url)
    const pagerank = (await GetPageRank(url))["response"][0]
    obj.page_index = pagerank["status_code"] == 200 ? 1 : 0
    obj.page_rank = pagerank["page_rank_decimal"]
    obj = await GetDNSRecords(obj)
    obj.status = isMalicious ? 1 : 0
    const geoIP = await GetGeoIP(url)
    obj.lat = geoIP[0]
    obj.lon = geoIP[1]
    obj.self_signed = await isSelfSigned(obj.url)
    console.log(obj)
    return obj
    const endpoint = ""
    const req = await fetch(endpoint)

    if(!req.ok){
        throw new Error("Could not fetch data from endpoint")
    }

    
}

async function AnalyseWebpage(obj : LinkObject) : Promise<LinkObject>{
    var browser : Browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try{
        const page = await browser.newPage();
        const baseLink : URL = new URL(obj.url);
        var newOBJ : LinkObject = obj
        var redirectionsExtCount = 0
        var redirectionsIntCount = 0
        var intErrors = 0
        var extErrors = 0
        var extMedia = 0
        var intMedia = 0
        obj.ratio_intMedia = 0
        obj.ratio_extMedia = 0
        obj.nb_redirection = 0
        obj.nb_external_redirection = 0
        obj.nb_extCSS = 0
        obj.popup_window = 0
        obj.submit_email = 0
        obj.ratio_intRedirection = 0
        obj.ratio_extRedirection = 0
        obj.ratio_intErrors = 0
        obj.ratio_extErrors = 0
        obj.links_in_tags = 0
        obj.nb_hyperlinks = 0
        obj.safe_anchor = 0
        obj.ratio_extHyperlinks = 0
        obj.ratio_intHyperlinks = 0
        obj.ratio_nullHyperlinks = 0
        obj.self_signed = 0
        // Listen for console messages and capture JavaScript errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                var url = msg.location().url
                if(url == undefined)
                    return
                const linkUrl = new URL(url);
                if(linkUrl.host == baseLink.host)
                    intErrors++
                else
                    extErrors++

                obj.ratio_extErrors = extErrors / (intErrors + extErrors)
                obj.ratio_intErrors = intErrors / (intErrors + extErrors)
            }
        });

        // Track redirections
        page.on('request', request => {
            if (request.redirectChain().length > 0) {
                const linkUrl = new URL(request.url());
                if(baseLink.origin == linkUrl.origin){
                    redirectionsIntCount++
                } else {
                    redirectionsExtCount++
                }
                obj.ratio_intRedirection = redirectionsExtCount / (redirectionsExtCount + redirectionsIntCount)
                obj.ratio_extRedirection = redirectionsIntCount / (redirectionsExtCount + redirectionsIntCount)
            }
        });

        // Track external CSS imports
        page.on('requestfinished', request => {
            const requestUrl = new URL(request.url());
            if (request.resourceType() === 'stylesheet' && requestUrl.origin !== baseLink.origin) {
                obj.nb_extCSS++;
            }

            if(request.resourceType() == "media"){
                if(requestUrl.origin !== baseLink.origin)
                    extMedia++;
                else 
                    intMedia++;

                obj.ratio_extMedia = extMedia / (extMedia + intMedia)
                obj.ratio_intMedia = intMedia / (extMedia + intMedia)
            }
        });

        await page.goto(obj.url, { waitUntil: 'load', timeout: 10000 });
        
        await setTimeout(() => {}, 5000)

        newOBJ = await page.evaluate((obj) => {
            var links = document.querySelectorAll('a')
            const baseLink : URL = new URL(obj.url);
            let internalCount = 0;
            let externalCount = 0;
            let nullCount = 0;

            links.forEach(link => {
                const href = link.href;
                if (href) {
                    const linkUrl = new URL(href);
                    if (linkUrl.origin === baseLink.origin) {
                        internalCount++;
                    } else {
                        externalCount++;
                    }
                } else {
                    nullCount++
                }
            });

            obj.nb_hyperlinks = internalCount + externalCount
            obj.safe_anchor = internalCount
            if(obj.nb_hyperlinks > 0){
                obj.ratio_extHyperlinks = externalCount / obj.nb_hyperlinks
                obj.ratio_intHyperlinks = internalCount / obj.nb_hyperlinks
                obj.ratio_nullHyperlinks = nullCount / obj.nb_hyperlinks
            }
            return obj
        }, newOBJ);
        
        newOBJ = await page.evaluate((obj) => {
            const baseLink : URL = new URL(obj.url);

            if(document.title == ""){
                obj.empty_title = 1
                obj.domain_in_title = 0
            }else{
                obj.empty_title = 0
                obj.domain_in_title = document.title.includes(baseLink.host) ? 1 : 0
            }
            return obj
        }, newOBJ)

        newOBJ = await page.evaluate((obj) => {
            const baseLink : URL = new URL(obj.url);

            var favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')?.getAttribute("href");
            if(favicon == undefined || null){
                obj.external_favicon = 0
            } else {
                const faviconURL = new URL(obj.url);
                faviconURL.host == baseLink.host ? obj.external_favicon = 0 : obj.external_favicon = 1
            }
            return obj
        }, newOBJ)

        newOBJ = await page.evaluate((obj) => {
            // Select possible input fields for username/email and password
            const usernameInput = document.querySelector('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"], input[id*="user"], input[id*="email"]');
            const passwordInput = document.querySelector('input[type="password"], input[name*="pass"], input[id*="pass"]');
            const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
            // Select a submit button
            const submitButton = document.querySelector('button[type="submit"], input[type="submit"], button[name*="login"], input[name*="login"], button[id*="login"], input[id*="login"]');
            
            obj.submit_email = mailtoLinks.length
            // Check if all parts of a typical login form are present
            usernameInput !== null && passwordInput !== null && submitButton !== null ? obj.login_form = 1 : obj.login_form = 0
            return obj
        }, newOBJ);

        newOBJ = await page.evaluate((obj) => {
            const baseLink : URL = new URL(obj.url);

            var iframes = document.querySelectorAll('iframe')
            obj.iframe = iframes.length
            obj.sfh = 0
            iframes.forEach(x =>
                new URL(x.src).origin !== baseLink.origin ? obj.sfh++ : () => {}
            )
            return obj
        }, newOBJ)
        
        newOBJ = await page.evaluate((obj) => {
            const baseLink : URL = new URL(obj.url);

            var iframes = document.querySelectorAll('iframe')
            obj.iframe = iframes.length
            obj.sfh = 0
            iframes.forEach(x =>
                new URL(x.src).origin !== baseLink.origin ? obj.sfh++ : () => {}
            )
            return obj
        }, newOBJ)
        await browser.close()
        return newOBJ
    }catch(err){
        console.log(err)
        browser.close()
        return Promise.reject()
    }
}
async function SolveWords(obj : LinkObject) : Promise<LinkObject>{
    var urlOBJ : URL = new URL(obj.url)
    obj.avg_word_host = 0
    obj.avg_word_path = 0
    obj.avg_words_raw = 0
    var hostSplit = urlOBJ.host.split(/[-.]+/)  
    hostSplit.forEach(x =>{
        obj.avg_word_host += x.length
        x.length > obj.longest_word_host || obj.longest_word_host == undefined ? obj.longest_word_host = x.length : () => {} 
        x.length < obj.shortest_word_host || obj.shortest_word_host == undefined ? obj.shortest_word_host = x.length : () => {} 
    })

    obj.avg_word_host = obj.avg_word_host / hostSplit.length

    var pathnameSplit = urlOBJ.pathname.split(/[-/]+/)
    pathnameSplit.forEach(x=>{
        obj.avg_word_path += x.length
        x.length > obj.longest_word_path || obj.longest_word_path == 0 || obj.longest_word_path == undefined ? obj.longest_word_path = x.length : () => {} 
        x.length < obj.shortest_word_path || obj.shortest_word_path == 0 || obj.shortest_word_path == undefined ? obj.shortest_word_path = x.length : () => {} 
    })
    obj.avg_word_path = obj.avg_word_path / pathnameSplit.length

    var hrefSplit = urlOBJ.href.replace(/^(https?:\/\/)/, '').split(/[-./]+/)
    hrefSplit.forEach(x =>{
        obj.avg_words_raw += x.length
        x.length > obj.longest_words_raw || obj.longest_words_raw == undefined ? obj.longest_words_raw = x.length : () => {} 
        x.length < obj.shortest_words_raw || obj.shortest_words_raw == 0 || obj.shortest_words_raw == undefined ? obj.shortest_words_raw = x.length : () => {} 
    })
    obj.length_words_raw = obj.avg_words_raw
    obj.avg_words_raw = obj.avg_words_raw / hrefSplit.length

    obj.char_repeat = findMaxSequentialRepeat(urlOBJ.href)
    //urlOBJ.href.split(/[-./:]+/).filter(x => x=="" || x==" ")
    return obj
}

function GetHostnameLength(url : string){
    const urlParsed = parse(url).hostname
    if(urlParsed == null)
        return 0;
    return urlParsed.length
}

function GetHost(url : string){
    const urlParsed = parse(url).host
    if(urlParsed == null)
        return "";
    return urlParsed
}

function digitRatio(str : string) {
    // Count the number of digits in the string
    let digitCount = 0;
    for (let i = 0; i < str.length; i++) {
        if (!isNaN(parseInt(str[i]))) {
            digitCount++;
        }
    }

    // Calculate the ratio of digits to total characters
    const ratio = digitCount / str.length;

    return ratio;
}

function containsPunycode(str : string) {
    // Regular expression to match Punycode-encoded strings
    const punycodeRegex = /xn--[a-zA-Z0-9]+/;
    
    // Test the string against the regular expression
    return punycodeRegex.test(str) ? 1 : 0;
}

async function GetPageRank(url:string) {
    const endpoint = `https://openpagerank.com/api/v1.0/getPageRank?domains%5B0%5D=${GetHost(url)}`
    const key = process.argv[2]

    if(key == undefined)
        return

    const req = await fetch(endpoint, {
        method: "GET",
        headers: {
            "API-OPR": key,
            "redirect": "follow"
        }
    })
    if(req.ok){
        return await req.json()
    }

}


function IsTLDSuspicious(url:string) : number {
    const pattern = /\b(?:pe|link|asia|tk|website|ae|top|ga|mx|work|exposed|xyz|go\.id|media|audio|gob\.pe|club|bj|rs|ml|review|la|sa\.gov\.au|icu|online|party)\b/;
    
    return url.match(pattern) == undefined ? 0 : 1
}

function getSubdomain(url: string): string {
    const parsed = parsetld(url);
    if (parsed.domain && parsed.subdomain) {
      return parsed.subdomain;
    }
    return "";
  }
  
  function containsTLD(subdomain: string): number {
    const parts = subdomain.split('.');
    var lastPart = ""
    for (const part of parts) {
      if (parsetld(`${lastPart}.${part}`).domain != null) {
        return 1;
      }
      lastPart = part
    }
    return 0;
  }

  function DoesHavePathExtension(url : URL) : number {
    var dotSplit = url.pathname.split(".")
    if(dotSplit.length < 1 || dotSplit == undefined)
        return 0
    if(dotSplit[dotSplit.length - 1].split("/").length > 0)
        return 1
    return 0
  }

  function findMaxSequentialRepeat(input: string): number {
    let maxCount = 0;
    let currentCount = 1;

    for (let i = 1; i < input.length; i++) {
        if (input[i] === input[i - 1]) {
            currentCount++;
        } else {
            maxCount = Math.max(maxCount, currentCount);
            currentCount = 1;
        }
    }

    // Check if the last sequence was the longest
    maxCount = Math.max(maxCount, currentCount);

    return maxCount;
}

async function DoesContainBrand(text:string): Promise<number> {
    var testSubjects = text.split(/[-.]+/)
    var resolvedCount = 0;
    await Promise.all(testSubjects.map(func => DoesBrandExist(func).then(() => resolvedCount++).catch((x) => { console.log(x)})));
    return resolvedCount
}

async function DoesBrandExist(name:string) : Promise<void> {
    const res = await DI.em.count(Brand, { Name: name} )
    if(res == 1)
        return
    return Promise.reject("")
};

async function GetDNSRecords(obj : LinkObject) : Promise<LinkObject> {
    var domain = parsetld(obj.url).domain
    obj.A_Records = 0
    obj.AAAA_Records = 0
    obj.CNAME_Records = 0
    obj.MX_Records = 0
    obj.NAPTR_Records = 0
    obj.NS_Records = 0
    obj.PTR_Records = 0
    obj.SOA_Records = 0
    obj.SRV_Records = 0
    obj.TXT_Records = 0

    await dns.promises.resolveAny(domain ? domain : "").then((result
    ) => {
        obj.dns_record = 1
        result.forEach(x => {
            if(x.type == "A")
                obj.A_Records++
            if(x.type == "AAAA")
                obj.AAAA_Records++
            if(x.type == "CNAME")
                obj.CNAME_Records++
            if(x.type == "MX")
                obj.MX_Records++
            if(x.type == "NAPTR")
                obj.NAPTR_Records++
            if(x.type == "NS")
                obj.NS_Records++
            if(x.type == "PTR")
                obj.PTR_Records++
            if(x.type == "SOA")
                obj.SOA_Records++
            if(x.type == "SRV")
                obj.SRV_Records++
            if(x.type == "TXT")
                obj.TXT_Records++
        }) 
    });
    
    return obj
}

async function isSelfSigned(url:string) : Promise<number> {
    var urlObj: URL = new URL(url)
    var host = urlObj.host
    let socket = tls.connect({
        port:443, 
        host,
        servername: host, // this is required in case the server enabled SNI
      }, () => {
        let x509Certificate = socket.getPeerX509Certificate();
        if(x509Certificate == undefined)
            return 1
        if(x509Certificate.issuer == x509Certificate.subject)
            return 0
      });
    return 1
}

async function GetGeoIP(url:string) : Promise<[number,number]> {
    const urlOBJ : URL = new URL(url)

    const ip = (await dns.promises.resolve(urlOBJ.host)).pop()
    const req = await fetch(`http://ip-api.com/json/${ip}`)
    const res = await req.json()
    return [res["lat"],res["lon"]]
}