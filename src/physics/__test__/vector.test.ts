import {Vec2,add,sub,scale,length} from "../vector"
const a = vec2(1,2);

const b = vec2(3,4);

const c = add(a,b);
expect(add(vec2(1,2), vec2(3,4)));
.toEqual({x:4,y:6});