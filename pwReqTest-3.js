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
/*	"match" : {"stat" : "unmet", "el" : null, "text" : {"en" : "Passwords must match", "fr" : "Les mots de passe doivent correspondre"}, check : function (p) {
			let p1 = p;
			let p2 = null;
			try {
				p2 = document.getElementById(p.getAttribute("data-match"));
			}
			catch (ex) {
				console.error ("Error with getting password matching: " + ex.toString());
				let passwords = document.querySelectorAll("input[type=password]");
				if (passwords.length > 1) {
					p1 = passwords[passwords.length-2];
					p2 = passwords[passwords.length-1];
				}
			}
			return p1.value == p2.value && pd1.value.match(/\S/);
		}
	}
};
*/

let myPwReqs = {};


function init () {
	passwordRequirementsDiv = document.getElementById("passwordRequirements");
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
				defLang = getLang(passwords[i]);

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
				addAriaDescribedBy(passwords[i]);
				passwords[i].addEventListener("keypress", function(ev) {removeAriaDescribedBy(ev.target);}, false);
				passwords[i].addEventListener("blur", function(ev) {
						setTimeout(function() {
							addAriaDescribedBy(ev.target);
						}, 1000);
					}, false);
			} else {
				if (passwords[i].hasAttribute("data-match")) {
					let minChars = passwords[i].getAttribute("data-match");
					myPwReqs["match"] = {"stat" : "unmet", "text" : {"en" : "Passwords must match", "fr" : "Les mots de passe doivent correspondre"}, "el" : null, check :  function (p1, p2) {
						/*
							let thisP = p;
							let otherP = getOtherP(thisP);

							if (!otherP) {
								try {
									thisP = document.querySelector(".newPassword");
									otherP = document.querySelector(".confirmPassword");
								}
								catch (ex) {
									console.error ("Error with getting password matching: " + ex.message);
									let passwords = document.querySelectorAll("input[type=password]");
									if (passwords.length > 1) {
										thisP = passwords[passwords.length-2];
										otherP = passwords[passwords.length-1];
									}
								}
							}
							*/
							return p1.value == p2.value && p1.value.match(/\S/);
						}
					};
					reqsList.appendChild(newLI("match"));
				}
			}
			passwords[i].addEventListener("keyup", checkReqs, false);
		}
		
		/*liveReg = document.createElement("div");
		liveReg.setAttribute("style", "display:none;");
		liveReg.setAttribute("aria-live", "assertive");
		passwordRequirementsDiv.appendChild(liveReg);*/
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
		return n.getAttribute("lang").replace(/-.*$/, "");
	} else {
		return (n.parentNode === null ? defLang : getLang(n.parentNode));
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

/*
var pword1, pword2, submitBtn = null;
var pwReqs = {
	"8chars" : {"stat" : "unmet", "el" : null, check : function (p) { return p.length >= 8;}},
	"lowerCase" : {"stat" : "unmet", "el" : null, check : function (p) { return p.match(/[a-z]/);}},
	"upperCase" : {"stat" : "unmet", "el" : null, check : function (p) { return p.match(/[A-Z]/);}},
	"specialChar" : {"stat" : "unmet", "el" : null, check : function (p) { return p.match(/[^\w\s]/);}},
	"digit" : {"stat" : "unmet", "el" : null, check : function (p) { return p.match(/[0-9]/);}},
	"match" : {"stat" : "unmet", "el" : null, check : function (p) { return pword1.value == pword2.value && pword1.value.match(/\S/);}},
}

pword1 = document.getElementById("pword1");
pword2 = document.getElementById("pword2");
for (var el in pwReqs) {
	pwReqs[el]["el"] = document.getElementById(el);
}
submitBtn = document.getElementById("submitBtn");
*/
function checkReqs (e) {
	let thisP = e.target;
	let otherP = getOtherP(thisP);
		/*
	if (p.hasAttribute("data-match")) {
		p = document.getElementById(p.getAttribute("data-match"));
		if (p === e.target) {
			p = document.querySelector(".newPassword");
		}
	}
	*/
	let allmet = true;
	for (var el in myPwReqs) {
		let change = false;
		if (myPwReqs[el].check(thisP, otherP)) {
			if (myPwReqs[el]["stat"] == "unmet") {
				change = true;
				myPwReqs[el]["stat"] = "met";
				//var statSpan = myPwReqs[el]["el"].getElementsByTagName("span")[0];
				//statSpan.innerHTML = myPwReqs[el]["stat"];
				//statSpan.classList.add("met");
			}
		} else {
			if (myPwReqs[el]["stat"] == "met") {
				change = true;
				myPwReqs[el]["stat"] = "unmet";
				//var statSpan = myPwReqs[el]["el"].getElementsByTagName("span")[0];
				//statSpan.innerHTML = myPwReqs[el]["stat"];
				//statSpan.classList.add("unmet");
			
			}
		}
		if (change) {
			//liveReg.textContent = myPwReqs[el]["text"][defLang] + " " + stringBundle[myPwReqs[el]["stat"]][defLang];
			var statSpan = myPwReqs[el]["el"].getElementsByTagName("span")[0];
			statSpan.innerHTML = myPwReqs[el]["stat"];
			statSpan.classList.add(myPwReqs[el]["stat"]);
		}
		if (myPwReqs[el]["stat"] == "unmet") allmet = false;
	}
}

function getOtherP (thisP) {
	try {
		return document.getElementById(thisP.getAttribute("data-match"));
	}
	catch (ex) {
		console.error ("ERROR: ensure there are two passwords with data-match attributes referring to each other's ID value.  Error: " + ex.message);
		return null;
	}
} // End of getOtherP

/*
pword1.addEventListener("keyup", checkReqs, false);
pword2.addEventListener("keyup", checkReqs, false);
*/

init();
