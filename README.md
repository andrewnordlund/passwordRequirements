# passwordRequirements
An accessible, bilingual, extensible dynamic password requirements checker.

Password checkers (when setting or resetting a password) in a site are common.  But most of them fall short when it comes to accessibility.  This implementation tries to fix that.

## How To Use It
Download from this repo. or `$ npm install nordburgPwReq`.  You'll need nordburgPwReq.js and nordburgPwReq.css.  Then in your HTML file, you'll need to include the nordburgPwReq.js and nordburgPwReq.css files in the `<head>` of your page.  Then, somewhere on the page, you'll need two password input fields: one for New Password, and one for Confirm Password.  (This widget requires/allows you to write those to give them your own styling, layout, etc.  But what is required is the following:
* The New Password input needs to have class `newPassword`
* The Confirm Password input needs to have class `confirmPassword`
* The New and Confirm Password inputs each need to have unique `id`s, and they need to have `data-match` attributes that point to each other.  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword">
...
<label for="pword2">Confirm Passowrd:</label>
<input type="password" id="pword2" data-match="pword1" class="confirmPassword">
```
	- Note: If, for some reason you only want 1 password `<input>`, just don't make a second one, and leave out the `data-match` attribute from the one you do have.  "Passwords must match" will be left out as a requirement.
* The list of password requirements needs to appear somewhere on the page.  The Javascript generates that for you, but you need to provide a `<div>` and a reference to that `<div>`.
	1. Create a `<div>` somewhere with a unique ID, such as: `<div id="passwordReqs"></div>`
	1. Reference that ID value in a `data-passwordRequirementsDiv` attribute in your New Password `<input>`
Ex:
```
<div id="passwordReqs"></div>
...
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword" data-passwordRequirementsDiv="passwordReqs">
```

* If your password reqirements includes a minimum number of characters, include that number in a `minlength` attribute in the New Password `<input>`, and add the class "minchars" to that `<input>`.  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword minchars" minlength="8" data-passwordRequirementsDiv="passwordReqs">
```
* If your password requirements includes a maxmium number of characters (and it really shouldn't unless it's 255 characters or something or if you know absolutely nothing about password strength or IT Security....I'm only including this because there are plenty of IT Security nincompoops out there calling the shots), then include that number in a `data-maxchars` attribute in the New Password Input.  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword maxchars" maxlength="20" data-passwordRequirementsDiv="passwordReqs">
```
* If, for some reason, you have different requirements for the length of password that the `<input>` _itself_ will accept, but the length requirements for the passwords are different, then use the native `minlength` and `maxlength` attributes to control that behavior, and use the attributes `data-minchars` and `data-maxchars` for your requirements. And add either class "minchars" and/or "maxchars" to the New Password `<input>`.  For example, if the `<input>` requires between 4 and 25 characters, but your requirements are between 8 and 20:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword minchars maxchars" data-minchars="8" data-maxchars="20" minlength="4" maxlength="25" data-passwordRequirementsDiv="passwordReqs">

```
* If you don't want your password minimum or maximum character requirements listed, just the "minchars" and "maxchars" classes from the `<input>`.
* For other password requirements, include pre-defined classnames.  For example, if your requirements include a special charactor, add class `specialChar` to the New Passwords input.  (All classes are to be included in the New Passwords input.)  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword minchars maxchars specialChar" data-minchars="8" data-maxchars="20" data-passwordRequirementsDiv="passwordReqs">
```
### Built-in Requirements
This widget comes with the following built-in requirements that can be added with class names:
* *lowercase*: There must be at least 1 lowercase character.
* *uppercase*: There must be at least 1 uppercase character.
* *specialChar*: There must be at least 1 special character.
* *digit*: There must be at least 1 numerical character (0-9)
* *doubleChars*: The same character isn't allowed to appear in the password twice in a row.  (Ex: `..sas...` is fine, but `...ss...` isn't)  (This should probably never be used....but IT Security nincompoops may require it.)
* *nospaces*: Spaces aren't allowed in the password. (This should probably never be used, but, again, IT Security nincompoops)

For example, a system that requires passwords to have at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character, with a minimum of 8 characters long would be coded like:
```
<label for="pword1">New Password:</label>
<input name="pword1" id="pword1" type="password" class="newPassword minchars maxchars lowercase uppercase specialChar digit" data-minchars="8" data-match="pword2" data-passwordRequirementsDiv="passwordReqs">
```

### Custom Requirements
But what if you want to prevent people from, say, using "Password" as a password?  Then you can create your own rule.
1. Add a `<script> </script>` in your HTML page.
1. In that script section, you'll need to add your requirement in JSON.  You'll add it to the pre-existing object `nordburgPwReq.custPwRequirements`.  You'll need the following to create a custom rule:
	- The name of your rule that follows the rules of CSS class names (Ex: `notPassword`)
	- The English text of how that rule will be written in the list of rules (Ex: "Does not contain `Password`")
	- Optionally, you can add other languages if you know their two-character language code.  (Ex: `"fr" : "Ne contient pas 'Password'"`)
	- A Javascript function called `check` that accepts two values (the values of each Password inputs) and does your computation to return `true` if the requirement is met, and `false` if not.

```
<script>
nordburgPwReq.custPwRequirements["notPassword"] = {"text" : {"en" : "Does not contain 'Password'", "fr" : "Ne contient pas 'Password'"}, check : function (p1, p2) {
	let re = /password/i;
	return !(p1.match(re) || p2.match(re));
}};
</script>
```
1. Add the name you've given to the list of classes in the New Password Input
```
<label for="pword1">New Password:</label>
<input name="pword1" id="pword1" type="password" class="newPassword minchars maxchars lowercase uppercase specialChar digit notPassword" data-minchars="8" data-match="pword2" data-passwordRequirementsDiv="passwordReqs">
```


## How it works
Upon page load, the script takes all the information from the above descrbbed classes, and `data-` attributes and constructs a list of password requirements.  These are referenced with `aria-describedby` in the New Password input.  When you tab to the New Password input and start typing, as conditions become met or unmet, the X's and checkmarks toggle.  There's also text that's exposed only to screen readers that comes after the requirement to tell screen reader users if the condition is met or not.

When you focus on the New Password input the `aria-describedby` attribute disappears.  If it were to stay, whenever a requirement's status (met/unmet) were to change Windows will have screen readers read out the entire list of requirements. Whereas VoiceOVer (iOS and Mac OS X as of this writing) won't.   That could get pretty verbose for Windows users, and not enough information for Apple users.  So each password requirement in the list is an `aria-live` region (with `aria-atomic="true"` so the whole rule and it's status is read out whenever there's a change).

The green and red for the checkmarks and X's each have a contrast ratio (against the default white background) of at least 4.5:1, as per WCAG 2.x AA.  (Though, they're pretty thick, so they probably count as bold even if their font-weight is only 400.)


## See it in action
Hosted here: [https://andrewnordlund.github.io/passwordRequirements/nordburgPwReqTest-Demo.html](https://andrewnordlund.github.io/passwordRequirements/nordburgPwReqTest-Demo.html).

## Advanced
### Other Languages
This widget comes with both English and French.  But other languages are possible too.  It's just a little bit more complicated.  You have to add text for any requirement that you want to use, as well as "met", "unmet", and "Your password must contain."

The "met", "unmet", and "Your password must contain" are all in an object called <code>nordburgPwReq.stringBundle</code>.  Just add entries with keys of your target language's 2 letter code and "met", "unmet", and "description".  For example:  in german you would put somewhere in your HTML:
```
<script>
nordburgPwReq.stringBundle["description"]["de"] = "Ihr Passwort muss enthalten"
...
</script>
```
And in that same script area to add text to an existing requirement, you'd use the object <code>nordburgPwReq.allPwReqs\["ruleName"\]\["text"\][2-letter language code] = "text to add";</code>

(For maximum length and minimum length, use "%d" where the number would go.)

Example, in German again, for minimum and maximum number of characters, in the same <code>&lt;script&gt;</code> as above:
```
nordburgPwReq.allPwReqs["minchars"]["text"]["de"] = "Mindestens %d Zeichen";
nordburgPwReq.allPwReqs["maxchars"]["text"]["de"] = "Maximal %d Zeichen";
```

*IMPORTANT*
In order for this to work, the components of this widget need to be a descendant of an element marked as the target language.  Ex: for the German example above: `<html lang="de">`.  On the above-linked Demo page, there's a set of French password `<inputs>` to demonstrate that they're in a `<section lang="fr">` inside a page that's marked as `<html lang="en">`.  The first set of password `<input>`s has no unique language associated with it, so the page language is used.  The French part has French associated with it, so it uses French.  If you use a language in your HTML where there's no text for that language, it will default to English.  In the Japanese Demo, the class "digit" is included, but no translation is given.  So it defaults to English.  (But the appropriate `lang` attributes are used.)

## See a Japanese demo
Hosted here: [https://andrewnordlund.github.io/passwordRequirements/japaneseDemo.html](https://andrewnordlund.github.io/passwordRequirements/japaneseDemo.html).
