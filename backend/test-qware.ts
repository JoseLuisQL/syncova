import "dotenv/config"; 
import { generateText, streamText, tool } from "ai"; 
import { createOpenAI } from "@ai-sdk/openai"; 
import { z } from "zod"; 

const qware = createOpenAI({ 
  baseURL: "https://api.qware.me/v1", 
  apiKey: process.env.AI_API_KEY 
}); 

async function test() { 
  try { 
    console.log("Probando generacion de texto basica..."); 
    const res1 = await generateText({ 
      model: qware("gpt-5.4"), 
      prompt: "Hola, responde con una palabra." 
    }); 
    console.log("Respuesta 1:", res1.text); 

    console.log("\nProbando funcion con streamText..."); 
    const res2 = await streamText({ 
      model: qware("gpt-4o"), 
      prompt: "Dime el clima en Madrid", 
      tools: { 
        getWeather: tool({ 
          description: "Obtener clima de ciudad", 
          parameters: z.object({ location: z.string() }), 
          execute: async ({ location }) => { 
            console.log(">> TOOL EJECUTADO PARA:", location); 
            return { temp: 25, condition: "Sunny" }; 
          } 
        }) 
      }, 
      maxSteps: 5 
    }); 

    let text = ""; 
    for await (const t of res2.textStream) { 
      text += t; 
    } 
    console.log("Respuesta Final Stream:", text); 
    
    // Check if it's empty
    if (text.length === 0) {
      console.log("\n❌ LA RESPUESTA FUE VACIA: QWARE SE COLGO DESPUES DEL TOOL CALL.");
    }
  } catch(e: any) { 
    console.error("Error fatal:", e.message); 
  } 
} 

test();
