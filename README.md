# passwordRequirements
An accessible, bilingual, extensible dynamic password requirements checker.

Password checkers (when setting or resetting a password) in a site are common.  But most of them fall short when it comes to accessibility.  This implementation tries to fix that.

## How To Use It
Download from this repo.  You'll need pwReqTest.js and pwReqTest.css and the /fonts directory.  Then in your HTML file, you'll need to include the pwReqTest.js and pwReqTest.css files in the `<head>` of your page.  Then, somewhere on the page, you'll need two password input fields: one for New Password, and one for Confirm Passwords.  (This widget requires/allows you to write those to give them your own styling, layout, etc.  But what is required is the following:
* The New Password input needs to have class `newPassword`
* The Confirm Password input needs to have class `confirmPassword`
* The New and Confirm Password inputs each need to have unique `id`s, and they need to have `data-match` attributes that point to each other.  Ex:
```
<label for="pword1">New Passowrd:>
<input type="password" id="pword1" data-match="pword2" class="newPassword">
...
<label for="pword2">Confirm Passowrd:>
<input type="password" id="pword2" data-match="pword1" class="confirmPassword">
```
* The list of password requirements needs to appear somewhere on the page.  The Javascript generates that for you, but you need to provide a `<div>` and a reference to that `<div>`.
	1. Create a `<div>` somewhere with a unique ID, such as: `<div id="passwordReqs"></div>`
	1. Reference that ID value in a `data-passwordRequirementsDiv`
Ex:
```
<div id="passwordReqs"></div>
...
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword" data-passwordRequirementsDiv="passwordReqs">
```

* If your password reqirements includes a minimum number of characters, include that number in a `data-minchars` attribute in the New Password Input.  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword" data-minchars="8" data-passwordRequirementsDiv="passwordReqs">
```
* If your password requirements includes a maxmium number of characters (and it really shouldn't unless it's 255 characters or something or if you know absolutely nothing about password strength or IT Security....I'm only including this because there are plenty of IT Security nincompoops out there calling the shots), then include that number in a `data-maxchars` attribute in the New Password Input.  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword" data-minchars="8" data-maxchars="20" data-passwordRequirementsDiv="passwordReqs">
```
* For other password requirements, include pre-defined classnames.  For example, if your requirements include a special charactor, add class `specialChar` to the New Passwords input.  (All classes are to be included in the New Passwords input.)  Ex:
```
<label for="pword1">New Passowrd:</label>
<input type="password" id="pword1" data-match="pword2" class="newPassword specialChar" data-minchars="8" data-maxchars="20" data-passwordRequirementsDiv="passwordReqs">
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
<input name="pword1" id="pword1" type="password" class="newPassword lowercase uppercase specialChar digit" data-minchars="8" data-match="pword2" data-passwordRequirementsDiv="passwordReqs">
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
<input name="pword1" id="pword1" type="password" class="newPassword lowercase uppercase specialChar digit notPassword" data-minchars="8" data-match="pword2" data-passwordRequirementsDiv="passwordReqs">
```


## How it works
Upon page load, the script takes all the information from the above descrbbed classes, and `data-` attributes and constructs a list of password requirements.  These are referenced with `aria-describedby` in the New Password input.  When you tab to the New Password input and start typing, as conditions become met or unmet, the X's and checkmarks toggle.  There's also text that's exposed only to screen readers that comes after the requirement to tell screen reader users if the condition is met or not.

When you focus on the New Password input the `aria-describedby` attribute disappears.  If it were to stay, whenever a requirement's status (met/unmet) were to change Windows will have screen readers read out the entire list of requirements. Whereas VoiceOVer (iOS and Mac OS X as of this writing) won't.   That could get pretty verbose for Windows users, and not enough information for Apple users.  So each password requirement in the list is an `aria-live` region (with `aria-atomic="true"` so the whole rule and it's status is read out whenever there's a change).

The green and red for the checkmarks and X's each have a contrast ratio (against the default white background) of at least 4.5:1, as per WCAG 2.x AA.  (Though, they're pretty thick, so they probably count as bold even if their font-weight is only 400.)


## See it in action
Hosted here: [https://andrewnordlund.github.io/passwordRequirements/pwReqTest-3.html](https://andrewnordlund.github.io/passwordRequirements/pwReqTest-3.html).
