(function () {
	const heightWave = document.getElementById("wave-height");
	const speedWave = document.getElementById("wave-speed");
	const harshnessWave = document.getElementById("wave-harshness");
	const angleWave = document.getElementById("angle-light");

	heightWave.oninput = function () {
		console.log(this.value);
	}

	speedWave.oninput = function () {
		console.log(this.value);
	}
	harshnessWave.oninput = function () {
		console.log(this.value);
	}
	angleWave.oninput = function () {
		console.log(this.value);
	}

	function myFunction() {
		document.getElementById("myDropdown").classList.toggle("show");
	}
})();
