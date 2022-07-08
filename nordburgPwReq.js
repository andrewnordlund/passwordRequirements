let nordburgPwReq = {
	version : "0.1.0",
	dbug : false,
	defLang : "en",
	descriptors : {},
	minchars : {},
	maxchars : {},
	regexes : {
		"special-char" : null,
		"unicode" : null,
		"max-consecutive" : {
			"default" : {
				"res" : "(.)\1{3}",
				"re" : null
			}
		}
	},
	stringBundle : {
		"description" : {"en" : "Your password must contain:", "fr" : "Votre mot de passe doit contenir :"},
		"met" : {"en" : "Met", "fr" : "Remplie"},
		"unmet" : {"en" : "Unmet", "fr" : "n'a pas été remplie"}
	},
	allPwReqs : {
		"lowercase" : {"text" : {"en" : "At least 1 lowercase letter", "fr" : "Au moins 1 lettre minuscule"}, check : function (p1, p2) {return p1.match(/[a-z]/) || p2.match(/[a-z]/);}},
		"uppercase" : {"text" : {"en" : "At least 1 uppercase letter", "fr" : "Au moins 1 lettre majuscule"}, check : function (p1, p2) {return p1.match(/[A-Z]/) || p2.match(/[A-Z]/);}},
		"special-char" : {"text" : {"en" : "At least 1 special character", "fr" : "Au moins 1 caractère spécial"}, check : function (p1, p2) { 
				return nordburgPwReq.regexes["special-char"].test(p1) || nordburgPwReq.regexes["special-char"].test(p2);
			}
		},
		"special" : {"text" : {"en" : "At least 1 special character (-~!@#$%^&*_+=`|(){}[:;\"'<>,.? ])", "fr" : "Au moins 1 caractère spécial (-~!@#$%^&*_+=`|(){}[:;\"'<>,.? ])"}, check : function (p1, p2) {
				let scre = /[-~!@#$%^&*_+=`\|\(\)\{\}\[:;"'<>,\.\? \]]/;
				return p1.match(scre) || p2.match(scre);
			}
		},
		"ascii-printable" : {"text" : {"en" : "At least 1 ascii-printable character", "fr" : "Au moins 1 caractère ascii-imprimable"}, check : function (p1, p2) {
				let re = /[\x20-\x7E]/;
				return p1.match(re) || p2.match(re);
			}
		},
		"unicode" : {"text" : {"en" : "At least 1 Unicode character", "fr" : "Au moins 1 caractère Unicode"}, check : function (p1, p2) {
				return nordburgPwReq.regexes["unicode"].test(p1) || nordburgPwReq.regexes["unicode"].test(p2);
			}
		},
		"digit" : {"text" : {"en" : "At least 1 digit", "fr" : "Au moins 1 chiffre"}, check : function (p1, p2) { return p1.match(/[0-9]/) || p2.match(/[0-9]/);}},
		"nospaces" : {"text" : {"en" : "No spaces", "fr" : "Sans espaces"}, check : function (p1, p2) { return !(p1.match(/[\s\n\t\f ]/) || p2.match(/[\s\n\t\f ]/));}},
		"max-consecutive" : {"text" : {"en" : "No more than %d characters the same consecutively", "fr" : "Pas plus de %d caractères identiques consécutivement"}, check : function (p1, p2) {
				return !(re.test(p1) || re.test(p2));
			}
		},
		"minchars" : {"text" : {"en" : "At least %d characters", "fr" : "Au moins %d caractères"}, check : function(p1, p2) { return nordburgPwReq.getLength(p1) >= 0 || nordburgPwReq.getLength(p2) >= 0}},
		"maxchars" : {"text" : {"en" : "A maximum of %d characters", "fr" : "Un maximum de %d caractères"}, check : function(p1, p2) { return nordburgPwReq.getLength(p1) <= 255 && nordburgPwReq.getLength(p2) <= 255;}},
		"match" : {"text" : {"en" : "Passwords must match", "fr" : "Les mots de passe doivent correspondre"}, check : function (p1, p2) { return p1 == p2 && p1.match(/\S/);}},

	},
	myPwReqs : {},
	custPwRequirements : {},

	init : function () {
		nordburgPwReq.setRegExes();
		let lang = nordburgPwReq.defLang;

		nordburgPwReq.dealWithCustomRequirements();

		let passwords = document.querySelectorAll(".nbpr-new-password,.nbpr-confirm-password");
		if (passwords) {
			let giveWarn = false;
			let giveWarn2 = false;
			for (let i = 0; i < passwords.length; i++) {
				let pLang = nordburgPwReq.defLang;
				if (!nordburgPwReq.myPwReqs[passwords[i].id]) nordburgPwReq.myPwReqs[passwords[i].id] = {"reqs" : {}, "lang" : nordburgPwReq.defLang, "descriptor" :  null, "reqsList" : null, "reqPos"  : "after"};
				if (passwords[i].classList.contains("nbpr-new-password")) {
					let usePasswordRules = false;
					let passwordRequirementsDiv = null;
					try {
						passwordRequirementsDiv = document.getElementById(passwords[i].getAttribute("data-passwordRequirementsDiv"));
					}
					catch (ex) {
						console.error (ex.message + "\nI think you need to create a <div> with the id that matches the data-passwordRequrementsDiv attribute in your New Password input.");
					}
					
					if (passwords[i].classList.contains("use-password-rules") && passwords[i].hasAttribute("passwordrules")) {
						usePasswordRules = true;
						let pwrules = passwords[i].getAttribute("passwordrules").split(";");
						for (let j = 0; j < pwrules.length; j++) {
							if (pwrules[j].trim().match(/^max-consecutive/i)) {
								let maxConsecutive = 4;
								let mxConsecutive = pwrules[j].replace(/\D/g, "");
								if (mxConsecutive > 1) maxConsecutive = mxConsecutive;
								passwords[i].setAttribute("data-max-consecutive", maxConsecutive);	// if use-password-rules, then it should override what's already there
								passwords[i].classList.add("max-consecutive");
							} else if (pwrules[j].trim().match(/^required/i)) {
								let requirement = pwrules[j].trim().replace(/^required[^:]*/i, "").trim();
								if (requirement.match(/,/)) {
									console.warn ("Using a comma delimited list is considered a custom requirement for this widget, and you'll have to do the work of creating a new nordburgPwReq.custPwRequirements rule yourself.");
								} else {
									if (requirement.match(/lower/)) passwords[i].classList.add("lowercase");
									if (requirement.match(/upper/)) passwords[i].classList.add("uppercase");
									if (requirement.match(/digit/)) passwords[i].classList.add("digit");
									if (requirement.match(/special/)) passwords[i].classList.add("special");
									if (requirement.match(/ascii-printable/)) passwords[i].classList.add("ascii-printable");
									if (requirement.match(/unicode/)) passwords[i].classList.add("unicode");
								}
							}
						}
					}

					
					if (passwordRequirementsDiv.classList.contains("req-pos-before")) nordburgPwReq.myPwReqs[passwords[i].id]["reqPos"] = "before";

					pLang = nordburgPwReq.getLang(passwordRequirementsDiv);
					nordburgPwReq.myPwReqs[passwords[i].id]["lang"] = pLang;
					
					let passwordDesc = null;
					let passwordDescText = nordburgPwReq.stringBundle["description"][nordburgPwReq.defLang];
					passwordDesc = document.createElement("p");
					passwordDesc.id = "nordburgPwReqPassDesc" + i;
					if (nordburgPwReq.stringBundle["description"][pLang]) {
						passwordDescText = nordburgPwReq.stringBundle["description"][pLang];
					} else {
						passwordDesc.setAttribute("lang", nordburgPwReq.defLang);
					}
					passwordDesc.textContent = passwordDescText;
					nordburgPwReq.myPwReqs[passwords[i].id]["descriptor"] = passwordDesc;
					nordburgPwReq.descriptors[passwords[i].id] = {"orig" : null, "descriptors" : [passwordDesc.id]};
					if (passwords[i].hasAttribute("aria-describedby")) nordburgPwReq.descriptors[passwords[i].id]["orig"] = passwords[i].getAttribute("aria-describedby");
					passwordRequirementsDiv.appendChild(passwordDesc);

					let reqsList = document.createElement("ul");
					reqsList.setAttribute("role","list");
					reqsList.id = "pwReqsUL" + i;
					reqsList.classList.add("pwReqsUL");
					passwordRequirementsDiv.appendChild(reqsList);
					nordburgPwReq.myPwReqs[passwords[i].id]["reqsList"] = reqsList;


					// build myPwReqs
					let reqs = passwords[i].getAttribute("class").split(" ");
					for (let j = 0; j < reqs.length; j++) {
						let chrCount = null;
						chrCount = reqs[j].match(/(m(?:in|ax))(length|chars)/i);
						if (chrCount) reqs[j] = chrCount[1]  + "chars";
						if (nordburgPwReq.allPwReqs[reqs[j]]) {
							if (Object.assign) {
								nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][reqs[j]] = Object.assign({}, nordburgPwReq.allPwReqs[reqs[j]]);
							} else {
								giveWarn2 = true;
								nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][reqs[j]] = nordburgPwReq.allPwReqs[reqs[j]];
							}
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][reqs[j]]["text"] = JSON.parse(JSON.stringify(nordburgPwReq.allPwReqs[reqs[j]]["text"]));

							
							if (chrCount) {
								let minmax = chrCount[1];
								let charCountNum = (passwords[i].hasAttribute("data-" + minmax + "chars") ? passwords[i].getAttribute("data-" + minmax + "chars") : passwords[i].getAttribute(minmax + "length")).replace(/\D/g, "");
								for (let lang in nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][minmax + "chars"]["text"]) {
									nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][minmax + "chars"]["text"][lang] = nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][minmax + "chars"]["text"][lang].replace("%d", charCountNum);
								}
								if (minmax == "max") {
									nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["maxchars"]["check"] = function(p1, p2) { return nordburgPwReq.getLength(p1) <= charCountNum && nordburgPwReq.getLength(p2) <= charCountNum;};
								} else {
									nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["minchars"]["check"] = function(p1, p2) { return nordburgPwReq.getLength(p1) >=charCountNum || nordburgPwReq.getLength(p2) >= charCountNum;};
								}
							}
							if (reqs[j] == "unicode" || reqs[j] == "special" || reqs[j] == "ascii-printable") giveWarn = true;
							if (reqs[j] == "max-consecutive") {
								let maxConsecutive = 4;
								if (passwords[i].hasAttribute("data-max-consecutive")) {
									let mxConsecutive = passwords[i].getAttribute("data-max-consecutive").replace(/\D/g, "");
									if (mxConsecutive > 1) maxConsecutive = mxConsecutive;
								}
								for (let lang in nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["max-consecutive"]["text"]) {
									nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["max-consecutive"]["text"][lang] = nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["max-consecutive"]["text"][lang].replace("%d", maxConsecutive);
								}
								nordburgPwReq.regexes["max-consecutive"][passwords[i].id] = {"res" : "(.)\\1{" + (maxConsecutive-1) + "}", "re" : null};
								let re = new RegExp(nordburgPwReq.regexes["max-consecutive"][passwords[i].id]["res"]);
								try {
									re = new RegExp(nordburgPwReq.regexes["max-consecutive"][passwords[i].id]["res"], "u");	// the u flag allows for characters like 💩 et al.
									nordburgPwReq.regexes["max-consecutive"][passwords[i].id]["re"] = re;
								}
								catch (ex) {
									nordburgPwReq.regexes["max-consecutive"][passwords[i].id]["res"] = "([\uD800-\uDBFF][\uDC00-\uDFFF])\\1{" + (maxConsecutive-1) + "}";
									re = new RegExp(nordburgPwReq.regexes["max-consecutive"][passwords[i].id]["res"]);
									giveWarn2 = true;
								}

								nordburgPwReq.regexes["max-consecutive"][passwords[i].id]["re"] = re;

								nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["max-consecutive"]["check"] = function(p1, p2, pid) {
									console.log ("pid: " + pid);
									if (!pid) return true;
									rv = true;
									re = nordburgPwReq.regexes["max-consecutive"][pid]["re"];
									rv = !(re.test(p1) || re.test(p2));
									return rv;
								}
							}
						}
					}

					if (passwords[i].hasAttribute("data-match")) {
						try {
							let otherP = passwords[i].getAttribute("data-match");
							
							if (Object.assign) {
								nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["match"] = Object.assign({}, nordburgPwReq.allPwReqs["match"]);
							} else {
								giveWarn2 = true;
								nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["match"] = nordburgPwReq.allPwReqs["match"];
							}
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["match"]["stat"] = "unmet";
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["match"]["li"] = null;


						


						}
						catch (ex) {
							console.error ("ERROR: ensure there are two passwords with data-match attributes referring to each other's ID value.  Error: " + ex.message);
							return null;
						}
					}
					
					passwords[i].addEventListener("keypress", function(ev) {nordburgPwReq.removeAriaDescribedBy(ev.target);}, false);
					passwords[i].addEventListener("blur", function(ev) {
							setTimeout(function() {
								nordburgPwReq.addAriaDescribedBy(ev.target);
							}, 500);
						}, false);
				} // End of if .nbpr-new-password
				passwords[i].addEventListener("keyup", nordburgPwReq.checkReqs, false);
				passwords[i].addEventListener("change", nordburgPwReq.checkReqs, false);
			}

			
			//Now build the list with myReqs
			
			for (let id in nordburgPwReq.myPwReqs) {
				for (let req in nordburgPwReq.myPwReqs[id]["reqs"]) {
					nordburgPwReq.myPwReqs[id]["reqsList"].appendChild(nordburgPwReq.newLI(req, id));
				}
				nordburgPwReq.addAriaDescribedBy(document.getElementById(id));
			}
			if (giveWarn) console.warn ("Warning: The use of special, ascii-printable, and/or unicode are not recommended.  They are included here because they are a part of the passwordrules proposal (https://github.com/whatwg/html/issues/3518) includes them. You would use them with 'allowed', but not 'required'.  And the special characters here are quite limited.  Use class 'special-char' for all non-alphanumeric/non-space characters (ie: the [\W\s] in regex).");
			if (giveWarn2) console.warn ("💩 You must be using Internet Exploder 💩.  Okay, fine you can only have one set of Password requiremnts on this page, along with severe limitations on accuracy and performance of checking certain unicode characters. 💩");
		}
	}, // End of init
	checkAssoc : function () {
		// This is entirely for debugging purposes.
		console.log ("Gotta check if associations are still correct.");
		for (let id in nordburgPwReq.myPwReqs) {
			console.log ("checkAssoc::Dealing with id: " + id + ".");
			if (Object.keys(nordburgPwReq.myPwReqs[id]).length > 0) {
				for (let req in nordburgPwReq.myPwReqs[id]["reqs"]) {
					console.log ("checkAssoc::Gonna check req: " + req + ".");
					try {
						console.log ("Associated " + id + " with " + nordburgPwReq.myPwReqs[id]["reqs"][req]["li"].id);
					}
					catch (ex) {
						console.error ("Looks like the li doesn't exist yet?\n" + ex.message);
					}
				}
			}
		}
	}, // End of checkAssoc
	addAriaDescribedBy : function (txt) {
		if (nordburgPwReq.descriptors[txt.id]) txt.setAttribute("aria-describedby", (nordburgPwReq.descriptors[txt.id]["orig"] ? nordburgPwReq.descriptors[txt.id]["orig"] + " " : "") + nordburgPwReq.descriptors[txt.id]["descriptors"].join(" "));
	}, // End of addAriaDescribedBy

	removeAriaDescribedBy :  function (txt) {
		txt.removeAttribute ("aria-describedby");
	}, // End of removeAriaDescribedBy

	getLang : function (n) {
		if (n.hasAttribute("lang")) {
			return n.getAttribute("lang").replace(/-.*$/, "");
		} else {
			return (n.nodeName == "HTML" || n.parentNode.nodeName == "#document" ? nordburgPwReq.defLang : nordburgPwReq.getLang(n.parentNode));
		}
	}, // End of getLang

	newLI : function (req, rid) {
		
		let newLI = document.createElement("li");
		newLI.id = "pwReqsList" + req + "LI" + rid;
		newLI.classList.add("pwReqsList" + req);
		
		let initStat = (nordburgPwReq.myPwReqs[rid]["reqs"][req].check("", "") ? "met" : "unmet");
		nordburgPwReq.myPwReqs[rid]["reqs"][req]["stat"] = initStat;

		let checkSpan = document.createElement("span");
		checkSpan.classList.add("pwCheckSpan");
		checkSpan.classList.add("req" + initStat); 
		checkSpan.classList.add("req" + initStat);
		checkSpan.setAttribute("aria-hidden", "true");
		newLI.appendChild(checkSpan);

		let newSpan = document.createElement("span");
		newSpan.id = "pwReqsList" + req + "Span" + rid;
		newSpan.setAttribute("aria-live", "polite");
		newSpan.setAttribute("aria-atomic", "true");
		newSpan.classList.add("pwReqText");
		
		let pLang = nordburgPwReq.myPwReqs[rid]["lang"];
		let textLang = (nordburgPwReq.myPwReqs[rid]["reqs"][req]["text"][pLang] ? pLang : nordburgPwReq.defLang);
		let statLang = (nordburgPwReq.stringBundle[initStat][pLang] ? pLang : nordburgPwReq.defLang);

		let txt = nordburgPwReq.myPwReqs[rid]["reqs"][req]["text"][textLang];
		let statText = nordburgPwReq.stringBundle[initStat][statLang];

		if (pLang != textLang) newSpan.setAttribute("lang", textLang);
		let statTextLang = (statLang == textLang ? "" : " lang=\"" + statLang + "\"");
		
		let statSpan = "<span class=\"invisibleStuff " + initStat + "\"" + statTextLang +">" + statText + "</span>";

		newSpan.innerHTML = (nordburgPwReq.myPwReqs[rid]["reqPos"] == "before" ? statSpan.replace("</span>", (statLang == "fr" ? " " : "") + ":&nbsp;</span>") + txt : txt + statSpan.replace(">", ">&nbsp;"));

		newLI.appendChild(newSpan);

		nordburgPwReq.myPwReqs[rid]["reqs"][req]["li"] = newSpan;
		
		if (nordburgPwReq.descriptors[rid]) nordburgPwReq.descriptors[rid]["descriptors"].push("pwReqsList" + req + "Span" + rid);
		
		return newLI;
	}, // End of newLI

	checkReqs : function (e) {
		let thisP = e.target;
		let thisPid = thisP.id
		let otherP = nordburgPwReq.getOtherP(thisP);
		if (!otherP) otherP = thisP;
		let otherPid = otherP.id;
		for (let req in nordburgPwReq.myPwReqs[thisP.id]["reqs"]) {
			nordburgPwReq.checkReq(thisP, otherP, req);
		}
		for (let req in nordburgPwReq.myPwReqs[otherP.id]["reqs"]) {
			nordburgPwReq.checkReq(otherP, thisP, req);
		}
	}, // End of checkReqs
	checkReq : function (p1, p2, req) {
		let change = false;
		if (nordburgPwReq.myPwReqs[p1.id]["reqs"][req].check(p1.value, p2.value, p1.id)) {
			if (nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"] == "unmet") {
				change = true;
				nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"] = "met";
			}
		} else {
			if (nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"] == "met") {
				change = true;
				nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"] = "unmet";
			}
		}
		if (change) {
			let textSpan = nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["li"];
			let statSpan = textSpan.getElementsByTagName("span")[0];

			let newStat = nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"];

			let pLang = nordburgPwReq.myPwReqs[p1.id]["lang"];
			let textLang = (nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["text"][pLang] ? pLang : nordburgPwReq.defLang);
			let statLang = (nordburgPwReq.stringBundle[newStat][pLang] ? pLang : nordburgPwReq.defLang);

			let statText = nordburgPwReq.stringBundle[newStat][statLang];
			
			if (statLang == textLang) {
				if (statSpan.hasAttribute("lang")) statSpan.removeAttribute("lang");
			} else {
				statSpan.setAttribute("lang", statLang);
			}
			if (nordburgPwReq.myPwReqs[p1.id]["reqPos"] == "before") {
				if (statLang == "fr") statText += " ";
				statText += ":\u00a0";
			} else {
				statText = "\u00a0" + statText;
			}
			statSpan.textContent = statText;

			if (statSpan.classList.contains("met")) statSpan.classList.remove("met");
			if (statSpan.classList.contains("unmet")) statSpan.classList.remove("unmet");
			statSpan.classList.add(newStat);

			let checkSpan = textSpan.parentNode.firstChild;
			if (checkSpan.classList.contains("reqmet")) checkSpan.classList.remove("reqmet");
			if (checkSpan.classList.contains("requnmet")) checkSpan.classList.remove("requnmet");
			checkSpan.classList.add("req" + newStat);
		}
		return nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"];
	}, // End of checkReq
	getOtherP : function (thisP) {
		try {
			return document.getElementById(thisP.getAttribute("data-match"));
		}
		catch (ex) {
			console.error ("ERROR: ensure there are two passwords with data-match attributes referring to each other's ID value.  Error: " + ex.message);
			return null;
		}
	}, // End of getOtherP
	dealWithCustomRequirements : function () {
		// Now add Custom Rules
		if (nordburgPwReq.custPwRequirements) {
			for (let req in nordburgPwReq.custPwRequirements) {
				if (Object.assign) {
					nordburgPwReq.allPwReqs[req] = Object.assign({}, nordburgPwReq.custPwRequirements[req]);
				} else {
					//console.warn ("You must be using Internet Exploder.  Okay, fine you can only have one set of Password requiremnts on this page.");
					nordburgPwReq.allPwReqs[req] = nordburgPwReq.custPwRequirements[req];
				}
			}
		}
	}, // End of dealWithCustomRequirements
	getLength : function (str) {
		// Inspired https://mathiasbynens.be/notes/javascript-unicode
		var astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
		if (str.match(astralSymbols)) str = str.replace(astralSymbols, 'x');
		return str.length;
	}, // End of getLength
	setRegExes : function () {
		let scre = new RegExp("[^\\w\\s]");
		let ure = new RegExp(".");
		try {
			scre = new RegExp("[^\\w\\s]", "u");
			ure = new RegExp(".", "u");
		}
		catch (ex) {
		}
	
		let mcre = new RegExp(nordburgPwReq.regexes["max-consecutive"]["default"]["res"], "g");
		try {
			mcre = new RegExp(nordburgPwReq.regexes["max-consecutive"]["default"]["res"], "gu");
		}
		catch (ex) {
		}
		
		
		nordburgPwReq.regexes["special-char"] = scre;
		nordburgPwReq.regexes["unicode"] = ure;
		nordburgPwReq.regexes["max-consecutive"]["default"]["re"] = mcre;
	}, // End of setRegExes
}

document.addEventListener("DOMContentLoaded", nordburgPwReq.init, false);
