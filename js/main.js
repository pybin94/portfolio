(() => {

	let yOffset = 0; // window.pageYOffset 대신 쓸 변수
	let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
	let currentScene = 0; // 현재 활성화된(눈 앞에 보고있는) 씬(scroll-section)
	let enterNewScene = false; // 새로운 scene이 시작된 순간 true

	const sceneInfo = [
		{
			// 0
			type: 'sticky',
			heightNum: 3, // 브라우저 높이의 5배로 scrollHeight 세팅
			scrollHeight: 0,
			objs: {
				container: document.querySelector('#scroll-section-0'),
				messageA: document.querySelector('#scroll-section-0 .main-message.a'),
				messageB: document.querySelector('#scroll-section-0 .main-message.b'),
				pencilLogo: document.querySelector('#scroll-section-0 .pencil-logo'),
				pencil: document.querySelector('#scroll-section-0 .pencil'),
				ribbonPath: document.querySelector('.ribbon-path path')
			},
			values: {
				messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
				messageB_opacity_in: [0, 1, { start: 0.4, end: 0.5 }],
				messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
				messageA_opacity_out: [1, 0, { start: 0.3, end: 0.4 }],
				messageB_opacity_out: [1, 0, { start: 0.6, end: 0.7 }],
				messageA_translateY_out: [0, -20, { start: 0.3, end: 0.4 }],
				pencilLogo_width_in: [1000, 200, { start: 0.1, end: 0.4 }],
				pencilLogo_width_out: [200, 50, { start: 0.4, end: 0.8 }],
				pencilLogo_translateX_in: [-10, -20, { start: 0.2, end: 0.4 }],
				pencilLogo_translateX_out: [-20, -50, { start: 0.4, end: 0.8 }],
				pencilLogo_opacity_out: [1, 0, { start: 0.8, end: 0.9 }],
				pencil_right: [-10, 70, { start: 0.3, end: 0.8 }],
				pencil_bottom: [-80, 100, { start: 0.3, end: 0.8 }],
				pencil_rotate: [-120, -200, { start: 0.3, end: 0.8 }],
				path_dashoffset_in: [1401, 0, { start: 0.2, end: 0.4 }],
				path_dashoffset_out: [0, -1401, { start: 0.6, end: 0.8 }]
			}
		}
	];

	function setLayout() {
		for (let i = 0; i < sceneInfo.length; i++) {
			if (sceneInfo[i].type === 'sticky') {
				sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
			} else if (sceneInfo[i].type === 'normal')  {
				sceneInfo[i].scrollHeight = sceneInfo[i].objs.content.offsetHeight + window.innerHeight * 0.5;
			}
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
		}

		yOffset = window.pageYOffset;

		let totalScrollHeight = 0;
		for (let i = 0; i < sceneInfo.length; i++) {
			totalScrollHeight += sceneInfo[i].scrollHeight;
			if (totalScrollHeight >= yOffset) {
				currentScene = i;
				break;
			}
		}
		document.body.setAttribute('id', `show-scene-${currentScene}`);
	}

	function calcValues(values, currentYOffset) {
		let rv;
		const scrollHeight = sceneInfo[currentScene].scrollHeight;
		const scrollRatio = currentYOffset / scrollHeight;

		if (values.length === 3) {
			const partScrollStart = values[2].start * scrollHeight;
			const partScrollEnd = values[2].end * scrollHeight;
			const partScrollHeight = partScrollEnd - partScrollStart;

			if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
				rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
			} else if (currentYOffset < partScrollStart) {
				rv = values[0];
			} else if (currentYOffset > partScrollEnd) {
				rv = values[1];
			}
		} else {
			rv = scrollRatio * (values[1] - values[0]) + values[0];
		}

		return rv;
	}

	function playAnimation() {
		const objs = sceneInfo[currentScene].objs;
		const values = sceneInfo[currentScene].values;
		const currentYOffset = yOffset - prevScrollHeight;
		const scrollHeight = sceneInfo[currentScene].scrollHeight;
		const scrollRatio = currentYOffset / scrollHeight;

		switch (currentScene) {
			case 0:
				if (scrollRatio <= 0.25) {
					// in
					objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
					objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
				} else {
					// out
					objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
					objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
				}

				if (scrollRatio <= 0.55) {
					// in
					objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
				} else {
					// out
					objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
				}

				if (scrollRatio <= 0.4) {
					objs.pencilLogo.style.width = `${calcValues(values.pencilLogo_width_in, currentYOffset)}vw`;
					objs.pencilLogo.style.transform = `translate(${calcValues(values.pencilLogo_translateX_in, currentYOffset)}%, -50%)`;
				} else {
					objs.pencilLogo.style.width = `${calcValues(values.pencilLogo_width_out, currentYOffset)}vw`;
					objs.pencilLogo.style.transform = `translate(${calcValues(values.pencilLogo_translateX_out, currentYOffset)}%, -50%)`;
				}

				if (scrollRatio <= 0.5) {
					objs.ribbonPath.style.strokeDashoffset = calcValues(values.path_dashoffset_in, currentYOffset);
				} else {
					objs.ribbonPath.style.strokeDashoffset = calcValues(values.path_dashoffset_out, currentYOffset);
				}

				objs.pencilLogo.style.opacity = calcValues(values.pencilLogo_opacity_out, currentYOffset);
				objs.pencil.style.right = `${calcValues(values.pencil_right, currentYOffset)}%`;
				objs.pencil.style.bottom = `${calcValues(values.pencil_bottom, currentYOffset)}%`;
				objs.pencil.style.transform = `rotate(${calcValues(values.pencil_rotate, currentYOffset)}deg)`;

				break;
		}
	}

	function scrollLoop() {
		enterNewScene = false;
		prevScrollHeight = 0;

		for (let i = 0; i < currentScene; i++) {
			prevScrollHeight += sceneInfo[i].scrollHeight;
		}

		if (yOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
			document.body.classList.remove('scroll-effect-end');
		}

		if (yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
			enterNewScene = true;
			if (currentScene === sceneInfo.length - 1) {
				document.body.classList.add('scroll-effect-end');
			}
			if (currentScene < sceneInfo.length - 1) {
				currentScene++;
			}
			document.body.setAttribute('id', `show-scene-${currentScene}`);
		}

		if (yOffset < prevScrollHeight) {
			enterNewScene = true;
			if (currentScene === 0) return;
			currentScene--;
			document.body.setAttribute('id', `show-scene-${currentScene}`);
		}

		if (enterNewScene) return;

		playAnimation();
	}

	window.addEventListener('load', () => {
        document.body.classList.remove('before-load');
		setLayout();

        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            scrollLoop();
  		});

  		window.addEventListener('resize', () => {
  			if (window.innerWidth > 900) {
  				setLayout();
			}
  		});

  		window.addEventListener('orientationchange', () => {
  			setTimeout(setLayout, 500);
		});
		  
		document.querySelector('.loading').addEventListener('transitionend', (e) => {
			document.body.removeChild(e.currentTarget);
		});

	});
	
})();

// main content

let con1 = document.querySelector('.con1');
let con2 = document.querySelector('.con2');
let con3 = document.querySelector('.con3');

window.addEventListener("scroll", function(){
	let browser_height = window.innerHeight;
	// console.log(browser_height)
	// console.log(pageYOffset);
	// var evt_target = document.querySelector('.target').offsetTop
	// - (browser_height / 2);
	const target = document.querySelector('#target');
	const clientRect = target.getBoundingClientRect().top;
	console.log(clientRect);
	if(clientRect < 334){
		document.querySelector('body').classList.add("dark");
		document.querySelector('.box-nav').classList.add("active");
	}else {
		document.querySelector('body').classList.remove("dark");
		document.querySelector('.box-nav').classList.remove("active");
		document.querySelector(".nextCon").classList.remove("active");
		document.querySelector('.con1 h1').style.display = "block";
		document.querySelector('.nav1').classList.add("active");
		document.querySelector('.nav2').classList.remove("active");
		document.querySelector('.nav3').classList.remove("active");
	};
	if(clientRect < 1){
	}else {
		document.querySelector(".con1").style.filter = "none";
		con2.classList.remove("active");
		con3.classList.remove("active");
	};
}, false)

function blur(){
	document.querySelector(".con1").style.filter = "blur(3px)"
}
function resetLi(){
	let li = document.querySelectorAll(".box-nav > ul > li")
	for(let i = 0; i < li.length; i++){
		li[i].classList.remove("active");
	}
}

let nav1 = document.querySelector('.nav1')
let nav2 = document.querySelector('.nav2')
let nav3 = document.querySelector('.nav3')

nav1.addEventListener("click", function(){
	resetLi();
	document.querySelector(".con1").style.filter = "none"
	con2.classList.remove("active");
	con3.classList.remove("active");
	nav1.classList.add("active");
});
nav2.addEventListener("click", function(){
	blur()
	resetLi()
	if(con3.classList.contains("active") === true){
		con3.classList.remove("active");
		setTimeout(function() {
			con2.classList.add("active");
		}, 1000);
	}else{
		con2.classList.add("active");
	}
	nav2.classList.add("active");
});
nav3.addEventListener("click", function(){
	blur()
	resetLi()
	if(con2.classList.contains("active") === true){
		con2.classList.remove("active");
		setTimeout(function() {
			con3.classList.add("active");
		}, 1000);
	}else{
		con3.classList.add("active");
	}
	nav3.classList.add("active");
});

// con1
document.querySelector('.con1 h1').addEventListener("click", function(){
	this.style.display = "none"
	document.querySelector(".nextCon").classList.add("active");
	document.querySelector(".shape img").style.transform = `scale(1.1) translate(-45%, -45%)`;
	setTimeout(function(){
		document.querySelector(".shape img").style.transform = `translate(-50%, -50%) `;
	},400)

});

// con2


let js = document.querySelector('.js');

js.addEventListener("click",function(){
	js.style.transform = `translate(0, 177%) scale( 1.03, 1.03 )`
	js.style.backgroundColor = "rgb(229, 248, 227)"
	js.style.boxShadow = `0px 0px 10px #fff`
	setTimeout(function(){
		let items = document.querySelectorAll('.item');
		for(var i = 17; i < items.length; i++){
			items[i].style.opacity = "0"
		}
		js.style.opacity = "0"

	},1200);
	setTimeout(function(){
		document.querySelector('.tetris').style.opacity = "0"
		document.querySelector('.tetris').style.zIndex = "-1"
	},2000)
	setTimeout(function(){
		document.querySelector('.tetris').style.display = "none"
	},2100)
	setTimeout(function(){
		document.querySelector('.skillNext').style.opacity = "1"
		document.querySelector('.skillNext').style.zIndex = "1"
	},2100)
	setTimeout(function(){
		document.querySelector('.frontEnd').classList.add("skillActive")
	},2800)
	setTimeout(function(){
		document.querySelector('.libFrame').classList.add("skillActive")
	},3500)
	setTimeout(function(){
		document.querySelector('.backEnd').classList.add("skillActive")
	},4200)
});
// con3

let button;
let contentWrap;
let imgArr;
let title;
let pageNum = 0;
let totalNum = 0;

window.onload = function(){
    contentWrap = document.querySelectorAll('.contentWrap');
    totalNum = contentWrap.length;

    button = document.querySelectorAll('button');

    imgArr = document.querySelectorAll("img");
    title = document.querySelectorAll("h1");

    button[0].addEventListener("click", function(){
        prevFunc();
    })
    button[1].addEventListener("click", function(){
        nextFunc();
    })
    pageSetFunc();
}

function prevFunc(){
    
    if(pageNum > 0){
        pageNum --;
    }else{
        pageNum = totalNum -1;
    }
    pageSetFunc();
}

function nextFunc(){
    
    if(pageNum < totalNum - 1){
        pageNum ++;
    }else{
        pageNum = 0;
    }
    pageSetFunc();
}

function pageSetFunc(){
    console.log(pageNum)
    //전체 리셋
    for(var i=0; i<contentWrap.length; i++){
        contentWrap[i].classList.remove("active");
    }
    for(var i=0; i<imgArr.length; i++){
        imgArr[i].classList.remove("active");
    }

    contentWrap[pageNum].classList.add("active");
    for(var i=0; i<4; i++){
        contentWrap[pageNum].getElementsByTagName("img")[i].classList.add("active");
    }
}


