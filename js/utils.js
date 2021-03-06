/**
 * 
 * @param {*} eleName 元素名
 * @param {*} classArr 类名数组
 * @param {*} styleObj 样式对象
 */
function createEle (eleName, classArr, styleObj) {
    var dom = document.createElement(eleName);

    for (var i = 0; i < classArr.length; i++) {
        dom.classList.add(classArr[i]);
    }

    for (var key in styleObj) {
        dom.style[key] = styleObj[key];
    }

    return dom;
}

/**
 * 存储得分数据
 * @param {*} key 
 * @param {*} value 
 */
function setLocal (key, value) {
    if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
}

function getLocal (key) {
    var value = localStorage.getItem(key);
    if (value !== null && (value[0] === '[' || value[0] === '{')) {
        return JSON.parse(value);
    }
    return value;
}

function formatNum (num) {
    if (num < 10)
        return '0' + num;
    return num;
}