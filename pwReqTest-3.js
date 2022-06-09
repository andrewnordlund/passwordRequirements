let passwords, passwordDesc, liveReg, passwordRequirementsDiv = null;
let defLang = "en";
let descriptors = ["passDesc"];

let stringBundle = {
	"desc" : {"en" : "Your password must contain at least:", "fr" : "Votre mot de passe doit contenir au moins :"},
	"met" : {"en" : "Met", "fr" : "Remplie"},
	"unmet" : {"en" : "Unmet", "fr" : "n'a pas été remplie"}
};
let  allPwReqs = {
	"lowercase" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 lowercase letter", "fr" : "1 lettre minuscule"}, check : function (p1, p2) { return  p1.value.match(/[a-z]/) || p2.value.match(/[a-z]/);}},
	"uppercase" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 uppercase letter", "fr" : "1 lettre majuscule"}, check : function (p1, p2) { return p1.value.match(/[A-Z]/) || p2.value.match(/[A-Z]/);}},
	"specialChar" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 special character", "fr" : "1 caractère spécial"}, check : function (p1, p2) { return p1.value.match(/[^\w\s]/) || p2.value.match(/[^\w\s]/);}},
	"digit" : {"stat" : "unmet", "el" : null, "text" : {"en" : "1 digit", "fr" : "1 chiffre"}, check : function (p1, p2) { return p1.value.match(/[0-9]/) || p2.value.match(/[0-9]/);}},
}

let myPwReqs = {};


function init () {
	passwordRequirementsDiv = document.getElementById("passwordRequirements");
	defLang = getLang(passwordRequirementsDiv);
	if (!stringBundle["desc"][defLang]) {
		defLang = "en";
	}
	passwordDesc = document.getElementById("passDesc");
	if (passwordDesc) passwordDesc.textContent = stringBundle["desc"][defLang];
	let reqsList = document.createElement("ul");
	reqsList.id = "pwReqsUL";
	reqsList.classList.add("pwReqsUL");
	passwordRequirementsDiv.appendChild(reqsList);



	passwords = document.querySelectorAll(".newPassword,.confirmPassword");
	if (passwords) {
		for (let i = 0; i < passwords.length; i++) {
			passwords[i].setAttribute("autocomplete", "new-password");
		
			if (passwords[i].classList.contains("newPassword")) {

				// build myPwReqs
				if (passwords[i].hasAttribute("data-minchars")) {
					let minChars = passwords[i].getAttribute("data-minchars");
					myPwReqs["minchars"] = {"stat" : "unmet", "text" : {"en" : minChars + " characters", "fr" : minChars + " caractères"}, "el" : null, check :  function(p1, p2) { return p1.value.length >= minChars || p2.value.length >= minChars;}};
					reqsList.appendChild(newLI("minchars"));
				}
				for (let req in allPwReqs) {
					if (passwords[i].classList.contains(req)) {
						myPwReqs[req] = allPwReqs[req];
						reqsList.appendChild(newLI(req));
					}
					
				}
				passwords[i].addEventListener("keypress", function(ev) {removeAriaDescribedBy(ev.target);}, false);
				passwords[i].addEventListener("blur", function(ev) {
						setTimeout(function() {
							addAriaDescribedBy(ev.target);
						}, 500);
					}, false);
			} else {
				if (passwords[i].hasAttribute("data-match")) {
					let minChars = passwords[i].getAttribute("data-match");
					myPwReqs["match"] = {"stat" : "unmet", "text" : {"en" : "Passwords must match", "fr" : "Les mots de passe doivent correspondre"}, "el" : null, check :  function (p1, p2) {
							return p1.value == p2.value && p1.value.match(/\S/);
						}
					};
					reqsList.appendChild(newLI("match"));
				}
			}
			passwords[i].addEventListener("keyup", checkReqs, false);
		}
		
		addAriaDescribedBy(document.querySelector(".newPassword"));
	}
} // End of init

function removeAriaDescribedBy(txt) {
	txt.removeAttribute ("aria-describedby");
} // End of removeAriaDescribedBy

function addAriaDescribedBy(txt) {
	txt.setAttribute("aria-describedby", descriptors.join(" "));
} // End of addAriaDescribedBy

function getLang(n) {
	if (n.hasAttribute("lang")) {
		return (stringBundle["desc"][n.getAttribute("lang").replace(/-.*$/, "")] ? n.getAttribute("lang").replace(/-.*$/, "") : defLang);
	} else {
		return (n.nodeName == "HTML" || n.parentNode.nodeName == "#document" ? defLang : getLang(n.parentNode));
	}
} // End of getLang

function newLI (req) {
	let newLI = document.createElement("li");
	newLI.id = "pwReqsList" + req + "LI";
	newLI.classList.add("pwReqsList" + req);

	let newSpan = document.createElement("span");
	newSpan.id = "pwReqsList" + req + "Span";
	newSpan.setAttribute("aria-live", "assertive");
	newSpan.setAttribute("aria-atomic", "true");
	newSpan.innerHTML = myPwReqs[req]["text"][defLang] + " <span class=\"unmet\">" + stringBundle["unmet"][defLang]  + "</span>";

	newLI.appendChild(newSpan);
	myPwReqs[req]["el"] = newSpan;
	descriptors.push("pwReqsList" + req + "Span");
	return newLI;
} // End of newLI

function checkReqs (e) {
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
			var statSpan = myPwReqs[el]["el"].getElementsByTagName("span")[0];
			statSpan.innerHTML = stringBundle[myPwReqs[el]["stat"]][defLang];
			statSpan.classList.remove("met", "unmet");
			statSpan.classList.add(myPwReqs[el]["stat"]);
		}
		if (myPwReqs[el]["stat"] == "unmet") allmet = false;
	}
} // End of checkReqs

function getOtherP (thisP) {
	try {
		return document.getElementById(thisP.getAttribute("data-match"));
	}
	catch (ex) {
		console.error ("ERROR: ensure there are two passwords with data-match attributes referring to each other's ID value.  Error: " + ex.message);
		return null;
	}
} // End of getOtherP

init();
