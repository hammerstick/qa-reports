/* SPDX-License-Identifier: GPL-3.0-only */

/* This file is part of qa-reports.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

"use strict";

/** This map is used to allow the user to input math symbols commonly used in machinists' documents */
let mathMap = new Map()
mathMap.set("\\pm\\","±")
mathMap.set("\\deg\\","°")
mathMap.set("\\stra\\","⏤")
mathMap.set("\\symm\\","⌯")
mathMap.set("\\ang\\","∠")
mathMap.set("\\perp\\","⊥")
mathMap.set("\\parag\\","▱")
mathMap.set("\\paral\\","∥")
mathMap.set("\\dia\\","⌀")
mathMap.set("\\c\\","○")
mathMap.set("\\cc\\","◎")
mathMap.set("\\ccros\\","⌖")
mathMap.set("\\clin\\","⌭")
mathMap.set("\\carc\\","⌒")
mathMap.set("\\chalf\\","⌓")
mathMap.set("\\depth\\","↧")
mathMap.set("\\cs\\","⌵") // countersink
mathMap.set("\\sq\\","□")
mathMap.set("\\ne2\\","⌰")
mathMap.set("\\ne\\","↗")
mathMap.set("\\cb\\","⌴")
mathMap.set("\\cF\\","Ⓕ")
mathMap.set("\\cL\\","Ⓛ")
mathMap.set("\\cM\\","Ⓜ")
mathMap.set("\\cP\\","Ⓟ")
mathMap.set("\\cT\\","Ⓣ")
mathMap.set("\\cU\\","Ⓤ")
