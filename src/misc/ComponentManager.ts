interface IComponentProp {
    name: string;
    key: string;
    custom?: boolean;
}

interface IComponentViewModel {
    props: IComponentProp[];
}

export class ComponentManager {
    static getViewModel(name: string, componentGetter: any) {
        switch (name) {
            case 'cc.UITransform':
                return new CCUITransformModel(componentGetter);
            case 'cc.Label':
                return new CCLabelModel();
            case 'cc.Sprite':
                return new CCSpriteModel();
            default:
                return new CCCommonModel(name, componentGetter);
        }
    }

    static getUserViewModel(name: string, componentGetter: any) {
        return new UserModel(name, componentGetter);
    }
}

const classNamePropMap: Record<string, {name:string, key:string, custom: boolean}[]> = {
    
}

const getPropList = (name: string, _: any) => {
    let props = classNamePropMap[name];
    if (props) {
        return props;
    }

    props = [];

    // todo
    // const component = componentGetter();
    // for (const key in component) {
    //     console.log("hhhhhh", name, key);
    //     if (Object.prototype.hasOwnProperty.call(component, key)) {
  
    //     }
    // }


    classNamePropMap[name] = props;

    return props;
}

class UserModel implements IComponentViewModel {

    props: IComponentProp[];

    constructor(name: string, componentGetter: any) {
   
        this.props = getPropList(name, componentGetter);
    }
}


class CCCommonModel implements IComponentViewModel {

    props: IComponentProp[];

    constructor(name: string, componentGetter: any) {
   
        this.props = getPropList(name, componentGetter);
    }
}

class CCUITransformModel implements IComponentViewModel {

    private componentGetter: any;

    props: IComponentProp[] = [
        { name: 'Width', key: 'width', custom: true },
        { name: 'Height', key: 'height', custom: true },
        { name: 'Anchor X', key: 'anchorX', custom: true },
        { name: 'Anchor Y', key: 'anchorY', custom: true },
    ]

    constructor(componentGetter: any) {
        this.componentGetter = componentGetter;
    }

    get component(): any {
        return this.componentGetter();
    }

    get width() {
        return this.componentGetter().contentSize.width;
    }

    set width(value: number) {
        const origin = this.component.contentSize;
        this.component.setContentSize(value, origin.height);
    }

    get height() {
        return this.component.contentSize.height;
    }

    set height(value: number) {
        const origin = this.component.contentSize;
        this.component.setContentSize(origin.width, value);
    }

    get anchorX() {
        return this.component.anchorPoint.x;
    }

    set anchorX(value: number) {
        const origin = this.component.anchorPoint;
        this.component.setAnchorPoint(value, origin.y);
    }

    get anchorY() {
        return this.component.anchorPoint.y;
    }

    set anchorY(value: number) {
        const origin = this.component.anchorPoint;
        this.component.setAnchorPoint(origin.x, value);
    }

}

class CCLabelModel implements IComponentViewModel {

    props: IComponentProp[] = [
        { name: 'String', key: 'string' },
        { name: 'Color', key: 'color' },
        { name: 'Font Size', key: 'fontSize' },
        { name: 'Line Height', key: 'lineHeight' },
    ];

}

class CCSpriteModel implements IComponentViewModel {

    props: IComponentProp[] = [
        { name: 'Color', key: 'color' },
    ];

}