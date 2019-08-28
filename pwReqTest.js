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

function checkReqs (e) {
	var p = pword1.value;
	var allmet = true;
	for (var el in pwReqs) {
		if (pwReqs[el].check(p)) {
			if (pwReqs[el]["stat"] == "unmet") {
				change = true;
				pwReqs[el]["stat"] = "met";
				var statSpan = pwReqs[el]["el"].getElementsByTagName("span")[0];
				statSpan.innerHTML = pwReqs[el]["stat"];
				statSpan.setAttribute("class", "met");
			}
		} else {
			if (pwReqs[el]["stat"] == "met") {
				change = true;
				pwReqs[el]["stat"] = "unmet";
				var statSpan = pwReqs[el]["el"].getElementsByTagName("span")[0];
				statSpan.innerHTML = pwReqs[el]["stat"];
				statSpan.setAttribute("class", "unmet");
			}
		}
		if (pwReqs[el]["stat"] == "unmet") allmet = false;
	}
}

pword1.addEventListener("keyup", checkReqs, false);
pword2.addEventListener("keyup", checkReqs, false);
