import "react";
import "react-dom";

import component from "./component";
import { bake } from "./shake";

import "purecss";
import "./main.css";

document.body.appendChild(component());

bake();
