// eslint-disable-next-line init-declarations
declare const cc: any;

export interface ICacheArgs {
    cacheDialog: boolean;
    cacheTitle: string;
    cacheData: {type: string, name:string, preview:string, id:string, size:number}[];
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

    public static getCache(): {cacheTile: string, cacheData: {type: string, name:string, preview:string, id:string, size:number}[]} {
        let rawCacheData = cc.assetManager.assets._map;
        let cacheData = [];
        let totalTextureSize = 0;
        for (let k in rawCacheData) {
            let item = rawCacheData[k];
            if (item.type !== 'js' && item.type !== 'json') {
                let itemName = '_';
                let preview = '';
                let content = item.__classname__;
                let formatSize = -1;
                if (item.type === 'png' || item.type === 'jpg') {
                    let texture = rawCacheData[k.replace('.' + item.type, '.json')];
                    if (texture && texture._owner && texture._owner._name) {
                        itemName = texture._owner._name;
                        preview = texture.content.url;
                    }
                } else {
                    if (item.name) {
                        itemName = item.name;
                    } else if (item._owner) {
                        itemName = (item._owner && item._owner.name) || '_';
                    }
                    if (content === 'cc.Texture2D') {
                        item = item.image;
                        preview = item.nativeUrl;
                        let textureSize = item.width * item.height * ((item._native === '.jpg' ? 3 : 4) / 1024 / 1024);
                        totalTextureSize += textureSize;
                        // sizeStr = textureSize.toFixed(3) + 'M';
                        formatSize = Math.round(textureSize * 1000) / 1000;
                    } else if (content === 'cc.SpriteFrame') {
                        preview = item._texture.nativeUrl;
                    }
                }

                if (preview.length > 0) {
                    preview = window.location.protocol + '//' + window.location.host + '/' +preview
                }

                cacheData.push({
                    queueId: item.queueId,
                    type: content,
                    name: itemName,
                    preview: preview,
                    id: item._uuid,
                    size: formatSize
                });
            }
        }
        let cacheTitle = `缓存 [文件总数:${cacheData.length}][纹理缓存:${totalTextureSize.toFixed(2) + 'M'}]`;
        return {cacheTile: cacheTitle, cacheData: cacheData};
    }

}
