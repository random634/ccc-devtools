// eslint-disable-next-line init-declarations
declare const cc: any;

export interface ICacheItem {
    type: string;
    name: string;
    preview: string;
    id: string;
    size: number;
}

export interface ICacheArgs {
    cacheDialog: boolean;
    cacheTitle: string;
    cacheData: ICacheItem[];
    cacheOnlyTexture: boolean;
    cacheSearchText: string;
}

export default class Utils {

    public static isShowingStates(): boolean {
        return cc && cc.profiler && cc.profiler.isShowingStats();
    }

    public static checkNodeValid(ccNode: any) {
        return ccNode && cc.isValid(ccNode)
    }

    public static outputToConsole(target: any) {
        let i = 1;
        // @ts-ignore
        while (window['temp' + i] !== undefined) {
            i++;
        }
        // @ts-ignore
        window['temp' + i] = target;
        console.log('temp' + i);
        // @ts-ignore
        console.log(window['temp' + i]);
    }

    public static drawNodeRect(target: any) {
        let rect;
        let transform = target.getComponent(cc.UITransformComponent);
        if (transform) {
            rect = this.getSelfBoundingBoxToWold(transform);
        } else {
            let worldPos = cc.v3();
            target.getWorldPosition(worldPos);
            rect = cc.rect(worldPos.x, worldPos.y, 0, 0);
        }
        let canvasNode = new cc.Node('Canvas');
        let scene = cc.director.getScene();
        scene.addChild(canvasNode);
        canvasNode.addComponent(cc.Canvas);
        let bgNode = new cc.Node();
        let graphics = bgNode.addComponent(cc.GraphicsComponent);
        let bgTransform = bgNode.addComponent(cc.UITransformComponent);
        canvasNode.addChild(bgNode);
        let centerPos = cc.v3(rect.center.x, rect.center.y, 0);
        let localPos = cc.v3();
        canvasNode.getComponent(cc.UITransformComponent).convertToNodeSpaceAR(centerPos, localPos);
        bgNode.setPosition(localPos);
        bgNode.layer = target.layer;
        let isZeroSize = rect.width === 0 || rect.height === 0;
        if (isZeroSize) {
            graphics.circle(0, 0, 100);
            graphics.fillColor = cc.Color.GREEN;
            graphics.fill();
        } else {
            bgTransform.width = rect.width;
            bgTransform.height = rect.height;
            graphics.rect(-bgTransform.width / 2, -bgTransform.height / 2, bgTransform.width, bgTransform.height);
            graphics.fillColor = new cc.Color().fromHEX('#E91E6390');
            graphics.fill();
        }
        setTimeout(() => {
            if (cc.isValid(canvasNode)) {
                canvasNode.destroy();
            }
        }, 2000);
        return target;
    }

    public static getComponentName(component: any) {
        return component.__classname__;
    }

    public static getComponents(ccNode: any) {
        return ccNode.components.map((component: any) => {
            return { name: component.__classname__, target: component }
        });
    }

    public static getSelfBoundingBoxToWold(transform: any) {
        let _worldMatrix = cc.mat4();
        if (transform.node.parent) {
            transform.node.parent.getWorldMatrix(_worldMatrix);
            let parentMat = _worldMatrix;
            let _matrix = cc.mat4();
            cc.Mat4.fromRTS(_matrix, transform.node.getRotation(), transform.node.getPosition(), transform.node.getScale());
            const width = transform._contentSize.width;
            const height = transform._contentSize.height;
            const rect = cc.rect(-transform._anchorPoint.x * width, -transform._anchorPoint.y * height, width, height);
            cc.Mat4.multiply(_worldMatrix, parentMat, _matrix);
            rect.transformMat4(_worldMatrix);
            return rect;
        } else {
            return transform.getBoundingBox();
        }
    }

    public static getTextureCache(cb: (result: {cacheTile: string, cacheData: ICacheItem[]}) => void) {
        let cacheMap = cc.assetManager.assets.map;
        let uuidList = [];
        let textureMap: any = {};
        for (let uuid in cacheMap) {
            let item = cacheMap[uuid];
            if (item.__classname__ == "cc.Texture2D") {
                let uuidImg = uuid.split("@")[0];
                if (textureMap[uuidImg] == null) {
                    textureMap[uuidImg] = true;
                    uuidList.push(uuidImg);
                }
                textureMap[uuidImg] = item;
            }
        }

        cc.assetManager.loadAny(uuidList, (err: any, assets: any[]) => {
            if (err) {
                console.error(err);
                cb({ cacheTile: '加载失败', cacheData: [] });
                return;
            }

            let totalTextureSize = 0;
            let cacheData: ICacheItem[] = [];

            for (let i = 0; i < assets.length; i++) {
                let texture = assets[i];
                let textureSize = texture.width * texture.height * ((texture._native === '.jpg' ? 3 : 4) / 1024 / 1024);
                let formatSize = Math.round(textureSize * 1000) / 1000;
                totalTextureSize += textureSize;

                cacheData.push({
                    type: texture.__classname__,
                    name: texture.name,
                    preview: window.location.protocol + '//' + window.location.host + '/' + texture.nativeUrl,
                    id: texture.uuid,
                    size: formatSize
                });
            }

            let cacheTitle = `纹理缓存 [总个数:${cacheData.length}][总大小:${totalTextureSize.toFixed(2) + 'M'}]`;
            cb({ cacheTile: cacheTitle, cacheData: cacheData });
        });
    }

}
