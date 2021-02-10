function deflate(arr) {
	return pako.deflate(arr, { "level": 9 });
}

function inflate(arr) {
	return pako.inflate(arr);
}

function arrToB64(arr) {
	var bytestr = "";
	arr.forEach(c => bytestr += String.fromCharCode(c));
	return btoa(bytestr).replace(/\+/g, "@").replace(/=+/, "");
}

function b64ToArr(str) {
	return new Uint8Array([...atob(decodeURIComponent(str).replace(/@/g, "+"))].map(c => c.charCodeAt()))
}

window.onload = function() {
	const copyToClipboard = str => {
		const el = document.createElement('textarea');
		el.value = str;
		el.setAttribute('readonly', '');
		el.style.position = 'absolute';
		el.style.left = '-9999px';
		document.body.appendChild(el);
		const selected =
			document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
		if (selected) {
			document.getSelection().removeAllRanges();
			document.getSelection().addRange(selected);
		}
	};
	const urlParams = new URLSearchParams(window.location.search)
	var code = document.getElementById("code");
	var output = document.getElementById("output");
	var input = document.getElementById("input");
	var cfmt = document.getElementById("code-format");
	var ifmt = document.getElementById("input-format");
	var submType = document.getElementById("code-type");
	function d(x) {
		return new TextDecoder("ascii").decode(inflate(b64ToArr(x)))
	}
	code.value=d(urlParams.get("c")||"")
	input.value=d(urlParams.get("i")||"")
	cifmt=urlParams.get("f")
	if(cifmt&2)cfmt.value="xxd"
	if(cifmt&1)ifmt.value="xxd"
	var CCode = CodeMirror.fromTextArea(code, {
		mode: "text/x-ez80",
		theme: "material",
		lineNumbers: true,
		lineWrapping: true,
		indentWithTabs: true,
		scrollbarStyle: null
	});
	var CInput = CodeMirror.fromTextArea(input, {
		mode: "text",
		theme: "material",
		lineNumbers: true,
		lineWrapping: true,
		indentWithTabs: true,
		scrollbarStyle: null
	});
	CCode.on("change", e => {
		CCode.save()
		length = document.getElementById("length")
		length.innerHTML = code.value.length;
		asmLength = document.getElementById("assembled-length")
		asmLength.innerHTML = asm(code.value).length;
	})
	CCode.on("cursorActivity", function() {
		tok = CCode.getTokenAt(CCode.getCursor())
		hint = document.getElementById("code-hint")
		token = tok.string.toUpperCase()
		console.log(tok)
		if(tok.type=="keyword") {
			hint.innerHTML = " Opcodes: <u>" + token + "</u>";
		} else if(tok.type="def") {
			if(token[0]==";")
				hint.innerHTML = " <u>Comments</u>";
			else if(token[0]==".")
				hint.innerHTML = " <u>Assembler Directives</u>";
			else if(token.match("[ABCD][XLH]|[CDES]S|[SD]I|[BIS]P")==token)
				hint.innerHTML = " Registers: <u>" + token + "</u>";
			else
				hint.innerHTML = "";
		} else if(tok.type==null) {
			hint.innerHTML = "";
		}
	});
	CInput.on("change", e => {
		CInput.save()
	})
	document.getElementById("permalink").addEventListener('click', (event) => {
		e = (x) => arrToB64(deflate(x))
		function setfmt(c, i) {o=0;if(c=="xxd")o+=1;o<<=1;if(i=="xxd")o+=1;return o}
		link = encodeURI(location.protocol+"//"
		                    +location.host+location.pathname
		                    +"?c="+e(code.value)
		                    +"&i="+e(input.value)
		                    +"&f="+setfmt(cfmt.value, ifmt.value)
		           )
		output.innerText=link
		copyToClipboard(link);
	})
	document.getElementById("markdown").addEventListener('click', (event) => {
		e = (x) => arrToB64(deflate(x))
		function setfmt(c, i) {o=0;if(c=="xxd")o+=1;o<<=1;if(i=="xxd")o+=1;return o}
		link = encodeURI(location.protocol+"//"
		                    +location.host+location.pathname
		                    +"?c="+e(code.value)
		                    +"&i="+e(input.value)
		                    +"&f="+setfmt(cfmt.value, ifmt.value)
		           )
		fmt = "## x86-16 machine code, " + document.getElementById("assembled-length").innerHTML + " bytes\n\nBinary:\n```\n"
		    + xxd(asm(code.value)) + "\n```\n\nListing:\n```\n"
		    + Listing(code.value)
		    + "\n```\n\n"
		    + ((submType.value=="function")?"Callable function. Inputs <input> in <reg>, <input> in <reg>. Result in <reg>.\n\n":"Standalone DOS .COM executable. Input from STDIN, output to STDOUT.\n\n")
		    + "[Try it on x86play!]("+link+")"
		output.innerText=fmt
		copyToClipboard(fmt);
	})
	document.getElementById("run").addEventListener('click', (event) => {
		output.innerHTML = execute(asm(code.value))
	})
	document.getElementById("collapse-code").addEventListener('click', (event) => {
		codearea = document.getElementById("codearea")
		collapseCode = document.getElementById("collapse-code")
		if(codearea.getAttribute("hidden")==null) {
			codearea.setAttribute("hidden","")
			collapseCode.innerHTML = "▶"+collapseCode.innerHTML.slice(1)
		} else {
			codearea.removeAttribute("hidden")
			collapseCode.innerHTML = "▼"+collapseCode.innerHTML.slice(1)
		}
	})
	document.getElementById("collapse-input").addEventListener('click', (event) => {
		codearea = document.getElementById("inputarea")
		collapseInput = document.getElementById("collapse-input")
		if(codearea.getAttribute("hidden")==null) {
			codearea.setAttribute("hidden","")
			collapseInput.innerHTML = "▶"+collapseInput.innerHTML.slice(1)
		} else {
			codearea.removeAttribute("hidden")
			collapseInput.innerHTML = "▼"+collapseInput.innerHTML.slice(1)
		}
	})
	document.getElementById("collapse-output").addEventListener('click', (event) => {
		codearea = document.getElementById("outputarea")
		collapseInput = document.getElementById("collapse-output")
		if(codearea.getAttribute("hidden")==null) {
			codearea.setAttribute("hidden","")
			collapseInput.innerHTML = "▶"+collapseInput.innerHTML.slice(1)
		} else {
			codearea.removeAttribute("hidden")
			collapseInput.innerHTML = "▼"+collapseInput.innerHTML.slice(1)
		}
	})

}