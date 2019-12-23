exports.service = async function () {
    return new Promise((resolve, reject) => {
        try {
            var arr = [];
            var obj = { "state": "Violet" };
            var obj1 = { "state": "Indigo" };
            var obj2 = { "state": "Blue" };
            var obj3 = { "state": "Green" };
            var obj4 = { "state": "Yellow" };
            var obj5 = { "state": "Orange" };
            var obj6 = { "state": "Red" };
            arr.push(obj);
            arr.push(obj1);
            arr.push(obj2);
            arr.push(obj3);
            arr.push(obj4);
            arr.push(obj5);
            arr.push(obj6);
            resolve(JSON.stringify(arr));
        } catch (error) {
            reject(new Error("Error in Color formation"));
        }
    });
}