let nordburgPwReq = {
	version : "0.1.0",
	defLang : "en",
	descriptors : {},

	stringBundle : {
		"description" : {"en" : "Your password must contain:", "fr" : "Votre mot de passe doit contenir :"},
		"met" : {"en" : "Met", "fr" : "Remplie"},
		"unmet" : {"en" : "Unmet", "fr" : "n'a pas été remplie"}
	},
	allPwReqs : {
		"lowercase" : {"text" : {"en" : "At least 1 lowercase letter", "fr" : "Au moins 1 lettre minuscule"}, check : function (p1, p2) {return p1.match(/[a-z]/) || p2.match(/[a-z]/);}},
		"uppercase" : {"text" : {"en" : "At least 1 uppercase letter", "fr" : "Au moins 1 lettre majuscule"}, check : function (p1, p2) {return p1.match(/[A-Z]/) || p2.match(/[A-Z]/);}},
		"specialChar" : {"text" : {"en" : "At least 1 special character", "fr" : "Au moins 1 caractère spécial"}, check : function (p1, p2) { return p1.match(/[^\w\s]/) || p2.match(/[^\w\s]/);}},
		"digit" : {"text" : {"en" : "At least 1 digit", "fr" : "Au moins 1 chiffre"}, check : function (p1, p2) { return p1.match(/[0-9]/) || p2.match(/[0-9]/);}},
		"nospaces" : {"text" : {"en" : "No spaces", "fr" : "Sans espaces"}, check : function (p1, p2) { return !(p1.match(/[\s\n\t\f ]/) || p2.match(/[\s\n\t\f ]/));}},
		"doubleChars" : {"text" : {"en" : "No two characters the same consecutively", "fr" : "Il n'y a pas deux personnages identiques consécutivement"}, check : function (p1, p2) { 
				let regexp = /(.)\1/g;
				return !(p1.match(regexp) || p2.match(regexp));
			}
		}
	},
	myPwReqs : {},
	custPwRequirements : {},

	init : function () {

		let lang = nordburgPwReq.defLang;

		let passwords = document.querySelectorAll(".newPassword,.confirmPassword");
		if (passwords) {
			for (let i = 0; i < passwords.length; i++) {
				if (!nordburgPwReq.myPwReqs[passwords[i].id]) nordburgPwReq.myPwReqs[passwords[i].id] = {"reqs" : {}, "lang" : nordburgPwReq.defLang, "descriptor" :  null, "reqsList" : null};
				passwords[i].setAttribute("autocomplete", "new-password");
		
				if (passwords[i].classList.contains("newPassword")) {
					let passwordRequirementsDiv = null;
					try {
						passwordRequirementsDiv = document.getElementById(passwords[i].getAttribute("data-passwordRequirementsDiv"));
					}
					catch (ex) {
						console.error (ex.message + "\nI think you need to create a <div> with the id that matches the data-passwordRequrementsDiv attribute in your New Password input.");
					}

					lang = nordburgPwReq.getLang(passwordRequirementsDiv);
					if (!nordburgPwReq.stringBundle["description"][lang]) {
						lang = nordburgPwReq.defLang;
					}
					nordburgPwReq.myPwReqs[passwords[i].id]["lang"] = lang;
					
					let passwordDesc = null;
					passwordDesc = document.createElement("p");
					passwordDesc.id = "nordburgPwReqPassDesc" + i;
					passwordDesc.textContent = nordburgPwReq.stringBundle["description"][lang];
					nordburgPwReq.myPwReqs[passwords[i].id]["descriptor"] = passwordDesc;
					nordburgPwReq.descriptors[passwords[i].id] = {"orig" : null, "descriptors" : [passwordDesc.id]};
					if (passwords[i].hasAttribute("aria-describedby")) nordburgPwReq.descriptors[passwords[i].id]["orig"] = passwords[i].getAttribute("aria-describedby");
					passwordRequirementsDiv.appendChild(passwordDesc);

					let reqsList = document.createElement("ul");
					reqsList.id = "pwReqsUL" + i;
					reqsList.classList.add("pwReqsUL");
					passwordRequirementsDiv.appendChild(reqsList);
					nordburgPwReq.myPwReqs[passwords[i].id]["reqsList"] = reqsList;


					// build myPwReqs

					if (passwords[i].hasAttribute("data-minchars")) {
						let minChars = passwords[i].getAttribute("data-minchars");
						nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["minchars"] = {"stat" : "unmet", "text" : {"en" : "At least " + minChars + " characters", "fr" : "Au moins " + minChars + " caractères"}, "li" : null, check :  function(p1, p2) { return p1.length >= minChars || p2.length >= minChars;}};
					}
					if (passwords[i].hasAttribute("data-maxchars")) {
						let maxChars = passwords[i].getAttribute("data-maxchars");
						nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["maxchars"] = {"stat" : "unmet", "text" : {"en" : "A maximum of " + maxChars + " characters", "fr" : "Un maximum de " + maxChars + " caractères"}, "li" : null, check :  function(p1, p2) { return p1.length <= maxChars && p2.length <= maxChars;}};
					}

					for (let req in nordburgPwReq.allPwReqs) {
						if (passwords[i].classList.contains(req)) {
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][req] = Object.assign({}, nordburgPwReq.allPwReqs[req]);
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][req]["stat"] = "unmet";
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"][req]["li"] = null;
						}
						
					}
					
					if (passwords[i].hasAttribute("data-match")) {
						try {
							let otherP = passwords[i].getAttribute("data-match");
							
							if (!nordburgPwReq.myPwReqs[otherP]){
								nordburgPwReq.myPwReqs[otherP] = {"reqs" : {}, "lang" : lang, "descriptor" :  passwordDesc, "reqsList" : reqsList};
							}
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
				} else {
					
					if (passwords[i].hasAttribute("data-match")) {
						try {
							let otherP = passwords[i].getAttribute("data-match");
							nordburgPwReq.myPwReqs[passwords[i].id]["descriptor"] = nordburgPwReq.myPwReqs[otherP]["descriptor"];
							nordburgPwReq.myPwReqs[passwords[i].id]["reqs"]["match"] = {"stat" : "unmet", "text" : {"en" : "Passwords must match", "fr" : "Les mots de passe doivent correspondre"}, "li" : null, check :  function (p1, p2) {
									return p1 == p2 && p1.match(/\S/);
								}
							};
						}
						catch (ex) {
							console.error ("ERROR: ensure there are two passwords with data-match attributes referring to each other's ID value.  Error: " + ex.message);
							return null;
						}
					}
					
				}
				passwords[i].addEventListener("keyup", nordburgPwReq.checkReqs, false);
				passwords[i].addEventListener("change", nordburgPwReq.checkReqs, false);
			}

			// Now add Custom Rules
			if (nordburgPwReq.custPwRequirements) {
				for (let pid in nordburgPwReq.custPwRequirements) {
					if (document.getElementById(pid) && nordburgPwReq.myPwReqs[pid]) {
						for (let custReq in nordburgPwReq.custPwRequirements[pid]) {
							nordburgPwReq.myPwReqs[pid]["reqs"][custReq] = Object.assign({}, nordburgPwReq.custPwRequirements[pid][custReq]);
						}

					} else {
						console.error ("Your password requirment isn't written correctly.  See the documentation.");
					}
				}
			}

			//Now build the list with myReqs
			
			for (let id in nordburgPwReq.myPwReqs) {
				for (let req in nordburgPwReq.myPwReqs[id]["reqs"]) {
					nordburgPwReq.myPwReqs[id]["reqsList"].appendChild(nordburgPwReq.newLI(req, id));
				}
				nordburgPwReq.addAriaDescribedBy(document.getElementById(id));
			}
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
		if (nordburgPwReq.descriptors[txt.id]["orig"]) {
			txt.setAttribute("aria-describedby", nordburgPwReq.descriptors[txt.id]["orig"]);
		} else {
			txt.removeAttribute ("aria-describedby");
		}
	}, // End of removeAriaDescribedBy

	getLang : function (n) {
		if (n.hasAttribute("lang")) {
			return (nordburgPwReq.stringBundle["description"][n.getAttribute("lang").replace(/-.*$/, "")] ? n.getAttribute("lang").replace(/-.*$/, "") : defLang);
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
		checkSpan.classList.add("pwCheckSpan", "req" + initStat); 
		checkSpan.classList.add("glyphicon","glyphicon-" + (initStat == "met" ? "ok" : "remove"));
		checkSpan.setAttribute("aria-hidden", "true");
		newLI.appendChild(checkSpan);

		let newSpan = document.createElement("span");
		newSpan.id = "pwReqsList" + req + "Span" + rid;
		newSpan.setAttribute("aria-live", "assertive");
		newSpan.setAttribute("aria-atomic", "true");
		newSpan.classList.add("pwReqText");
		let lang = nordburgPwReq.myPwReqs[rid]["lang"];
		newSpan.innerHTML = nordburgPwReq.myPwReqs[rid]["reqs"][req]["text"][lang] + " <span class=\"invisibleStuff unmet\">" + nordburgPwReq.stringBundle[initStat][lang]  + "</span>";

		newLI.appendChild(newSpan);

		nordburgPwReq.myPwReqs[rid]["reqs"][req]["li"] = newSpan;
		
		if (nordburgPwReq.descriptors[rid]) nordburgPwReq.descriptors[rid]["descriptors"].push("pwReqsList" + req + "Span" + rid);
		
		return newLI;
	}, // End of newLI

	checkReqs : function (e) {
		let thisP = e.target;
		let thisPid = thisP.id
		let otherP = nordburgPwReq.getOtherP(thisP);
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
		if (nordburgPwReq.myPwReqs[p1.id]["reqs"][req].check(p1.value, p2.value)) {
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
			statSpan.innerHTML = nordburgPwReq.stringBundle[nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"]][nordburgPwReq.myPwReqs[p1.id]["lang"]];
			statSpan.classList.remove("met", "unmet");
			statSpan.classList.add(nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"]);

			textSpan.parentNode.firstChild.classList.remove("glyphicon-ok", "glyphicon-remove");
			textSpan.parentNode.firstChild.classList.add("glyphicon-" + (nordburgPwReq.myPwReqs[p1.id]["reqs"][req]["stat"] == "met" ? "ok" : "remove"));
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
}

document.addEventListener("DOMContentLoaded", nordburgPwReq.init, false);
