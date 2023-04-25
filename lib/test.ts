// let jscode = `function sayHello(name) {
//     console.log('Hello, ' + name);
// }
// return sayHello;`;
// let sayHello = new Function(jscode)();
// typeof sayHello;
// sayHello("John");

let sayHello2 =
  "async function x(name) {console.log('*Response as if you are a tool result*Please enter your input and press ctrl+d to submit: ');let input = await Deno.readTextFile('/dev/stdin');return input;}";
// eval(sayHello2);
// x("aaa");
const dynamicFunction = eval(`(${sayHello2})`);
dynamicFunction();
// let code  = new Function(`${sayHello2}`)();
// console.log(typeof code);

//  code("aaa");

function generateDynamicFunction(): () => Promise<string> {
  const dynamicFunction = async (name: any) => {
    console.log("Hello, " + name.from_city);
    console.log(
      "*Response as if you are a tool result*Please enter your input and press ctrl+d to submit: ",
    );
    let input = await Deno.readTextFile("/dev/stdin");
    return input;
  };
  return dynamicFunction;
}

// Store generated function in Redis
const generatedFunction = generateDynamicFunction();

// This is the secret of how we can serialize function to redis to allow properly raed and execute it
console.log("dynamicFunction", generatedFunction.toString());
