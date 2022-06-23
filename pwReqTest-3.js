let nordburgPwReq = {
	//passwordDesc : null,
	//passwordRequirementsDiv : null,
	defLang : "en",
	descriptors : {},

	stringBundle : {
		"desc" : {"en" : "Your password must contain at least:", "fr" : "Votre mot de passe doit contenir au moins :"},
		"met" : {"en" : "Met", "fr" : "Remplie"},
		"unmet" : {"en" : "Unmet", "fr" : "n'a pas été remplie"}
	},
	allPwReqs : {
		"lowercase" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 lowercase letter", "fr" : "1 lettre minuscule"}, check : function (p1, p2) { return  p1.value.match(/[a-z]/) || p2.value.match(/[a-z]/);}},
		"uppercase" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 uppercase letter", "fr" : "1 lettre majuscule"}, check : function (p1, p2) { return p1.value.match(/[A-Z]/) || p2.value.match(/[A-Z]/);}},
		"specialChar" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 special character", "fr" : "1 caractère spécial"}, check : function (p1, p2) { return p1.value.match(/[^\w\s]/) || p2.value.match(/[^\w\s]/);}},
		"digit" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 digit", "fr" : "1 chiffre"}, check : function (p1, p2) { return p1.value.match(/[0-9]/) || p2.value.match(/[0-9]/);}},
		"doubleChars" : {"stat" : "met", "el" : null, "text" : {"en" : "No two characters the same consecutively", "fr" : "Il n'y a pas deux personnages identiques consécutivement"}, check : function (p1, p2) { 
				let regexp = /(.)\1/g;
				return !(p1.value.match(regexp) || p2.value.match(regexp));
			}
		}
	},
	myPwReqs : {},

	init : function () {
//		passwordRequirementsDiv = document.getElementById("passwordRequirements");
//		defLang = getLang(passwordRequirementsDiv);
//		if (!stringBundle["desc"][defLang]) {
//			defLang = "en";
//		}
//		passwordDesc = document.getElementById("passDesc");
//		let reqsList = document.createElement("ul");
//		reqsList.id = "pwReqsUL";
//		reqsList.classList.add("pwReqsUL");
//		passwordRequirementsDiv.appendChild(reqsList);


		let passwordDesc = null;

		let passwords = document.querySelectorAll(".newPassword,.confirmPassword");
		if (passwords) {
			for (let i = 0; i < passwords.length; i++) {
				passwords[i].setAttribute("autocomplete", "new-password");
		
				if (passwords[i].classList.contains("newPassword")) {
					let passwordRequirementsDiv = document.getElementById(passwords[i].getAttribute("data-passwordRequirementsDiv"));
					defLang = nordburgPwReq.getLang(passwordRequirementsDiv);
					if (!stringBundle["desc"][defLang]) {
						defLang = "en";
					}
					//passwordDesc = document.getElementById("passDesc");
					passwordDesc = document.createElement("p");
					passwordDesc.id = "nordburgPwReqPassDesc" + i;
					nordburgPwReq.descriptors.push(passwordDesc.id)
					passwordRequirementsDiv.appendChild(passwordDesc);

					let reqsList = document.createElement("ul");
					reqsList.id = "pwReqsUL" + i;
					reqsList.classList.add("pwReqsUL");
					passwordRequirementsDiv.appendChild(reqsList);


					// build myPwReqs
					if (passwords[i].hasAttribute("data-minchars")) {
						let minChars = passwords[i].getAttribute("data-minchars");
						nordburgPwReq.myPwReqs["minchars"] = {"stat" : "unmet", "text" : {"en" : minChars + " characters", "fr" : minChars + " caractères"}, "el" : null, check :  function(p1, p2) { return p1.value.length >= minChars || p2.value.length >= minChars;}};
						//reqsList.appendChild(newLI("minchars"));
					}
					for (let req in allPwReqs) {
						if (passwords[i].classList.contains(req)) {
							nordburgPwReq.myPwReqs[req] = allPwReqs[req];
							//reqsList.appendChild(newLI(req));
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
						//let minChars = passwords[i].getAttribute("data-match");	// What's this even doing here?
						myPwReqs["match"] = {"stat" : "unmet", "text" : {"en" : "Passwords must match", "fr" : "Les mots de passe doivent correspondre"}, "el" : null, check :  function (p1, p2) {
							return p1.value == p2.value && p1.value.match(/\S/);
							}
						};
						//reqsList.appendChild(newLI("match"));
					}
				}
				passwords[i].addEventListener("keyup", nordburgPwReq.checkReqs, false);
			}
			//Now build the list with myReqs

			if (Object.keys(nordburgPwReq.myPwReqs).length > 0 && passwordDesc) passwordDesc.textContent = nordburgPwReq.stringBundle["desc"][defLang];
			for (let req in myPwReqs) {
				reqsList.appendChild(newLI(req));
			}

			addAriaDescribedBy(document.querySelector(".newPassword"));
		}
	}, // End of init

	removeAriaDescribedBy :  function (txt) {
		txt.removeAttribute ("aria-describedby");
	}, // End of removeAriaDescribedBy

	addAriaDescribedBy : function (txt) {
		txt.setAttribute("aria-describedby", descriptors.join(" "));
	}, // End of addAriaDescribedBy

	getLang : function (n) {
		if (n.hasAttribute("lang")) {
			return (nordburgPwReq.stringBundle["desc"][n.getAttribute("lang").replace(/-.*$/, "")] ? n.getAttribute("lang").replace(/-.*$/, "") : defLang);
		} else {
			return (n.nodeName == "HTML" || n.parentNode.nodeName == "#document" ? defLang : getLang(n.parentNode));
		}
	} // End of getLang

	newLI : function (req) {
		let newLI = document.createElement("li");
		newLI.id = "pwReqsList" + req + "LI";
		newLI.classList.add("pwReqsList" + req);
		//newLI.classList.add
		let checkSpan = document.createElement("span");
		checkSpan.classList.add("requnmet");
		checkSpan.setAttribute("aria-hidden", "true");
		newLI.appendChild(checkSpan);

		let newSpan = document.createElement("span");
		newSpan.id = "pwReqsList" + req + "Span";
		newSpan.setAttribute("aria-live", "assertive");
		newSpan.setAttribute("aria-atomic", "true");
		newSpan.innerHTML = myPwReqs[req]["text"][defLang] + " <span class=\"invisibleStuff unmet\">" + stringBundle["unmet"][defLang]  + "</span>";

		newLI.appendChild(newSpan);
		myPwReqs[req]["el"] = newSpan;
		descriptors.push("pwReqsList" + req + "Span");
		return newLI;
	}, // End of newLI

	checkReqs : function (e) {
		let thisP = e.target;
		let otherP = getOtherP(thisP);
		let allmet = true;
		for (var el in myPwReqs) {
			let change = false;
			if (myPwReqs[el].check(thisP, otherP)) {
				if (myPwReqs[el]["stat"] == "unmet") {
					change = true;
					myPwReqs[el]["stat"] = "met";
				}
			} else {
				if (myPwReqs[el]["stat"] == "met") {
					change = true;
					myPwReqs[el]["stat"] = "unmet";
				
				}
			}
			if (change) {
				let statSpan = myPwReqs[el]["el"];
				let innerSpan = statSpan.getElementsByTagName("span")[0];
				innerSpan.innerHTML = stringBundle[myPwReqs[el]["stat"]][defLang];
				innerSpan.classList.remove("met", "unmet");
				innerSpan.classList.add(myPwReqs[el]["stat"]);
				statSpan.parentNode.firstChild.classList.remove("reqmet", "requnmet");
				statSpan.parentNode.firstChild.classList.add("req" + myPwReqs[el]["stat"]);
			}
			if (myPwReqs[el]["stat"] == "unmet") allmet = false;
		}
	}, // End of checkReqs

	getOtherP : function (thisP) {
		try {
			return document.getElementById(thisP.getAttribute("data-match"));
		}
		catch (ex) {
			console.error ("ERROR: ensure there are two passwords with data-match attributes referring to each other's ID value.  Error: " + ex.message);
			return null;
		}
	} // End of getOtherP
}

document.addEventListener("DOMContentLoaded", nordburgPwReq.init, false);
