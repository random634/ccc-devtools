<template>
    <el-dialog v-if="cacheArgs" v-model="cacheArgs.cacheDialog" :before-close="handleClose">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>{{cacheArgs.cacheTitle}}</span>
                    <el-input v-model="cacheArgs.cacheSearchText" :prefix-icon="Search" placeholder="Search">
                    </el-input>
                </div>
            </template>

            只显示纹理: <el-switch v-model="cacheArgs.cacheOnlyTexture" />
            <el-table :data="filterCacheData"  style="width:100%" max-height="500">
                <el-table-column label="Type" prop="type" sortable />
                <el-table-column label="Name" prop="name" sortable />
                <el-table-column label="Id" prop="id" sortable />
                <el-table-column prop="size" label="Size" width="100" sortable>
                    <template #default="{ row }">
                        {{ row.size == -1 ? '_' : (row.size +'MB') }}
                    </template>
                </el-table-column>
                <el-table-column prop="preview" label="Preview">
                    <template #default="{ row }">
                        <div style="height: 60px;display: flex;align-items: center;">
                            <img :src="row.preview"
                                style="max-height: 60px;max-width: 120px;" v-if="row.preview">
                            <template v-else>_</template>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Search } from '@element-plus/icons-vue'
import { ICacheArgs } from '@/misc/Utils';

const props = defineProps<{cacheArgs: ICacheArgs}>();

const filterCacheData = computed(() =>
props.cacheArgs.cacheData.filter(
    (data) => {
        const isTextureOnly = props.cacheArgs.cacheOnlyTexture;
        if (isTextureOnly) {
            const isTexture = data.type === 'cc.Texture2D';
            if (!isTexture) {
                return false;
            }
        }

        const tempSearchText = props.cacheArgs.cacheSearchText;
        if (tempSearchText && tempSearchText.length > 0) {
            return data.name.toLowerCase().includes(tempSearchText.toLowerCase());
        }

        return true;
    }
  )
)


const handleClose = (done: () => void) => {
    done();
};
</script>
