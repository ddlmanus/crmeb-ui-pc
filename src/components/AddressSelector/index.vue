<template>
  <div class="address-selector">
    <el-dialog
      title="添加收货地址"
      :visible.sync="visible"
      width="600px"
      @close="handleClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="收货人" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        
        <el-form-item label="所在地区" prop="regionText">
          <el-cascader
            v-model="regionValue"
            :options="regionOptions"
            :props="cascaderProps"
            placeholder="请选择省市区"
            @change="handleRegionChange"
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProvinceList, getCityList, getDistrictList } from '@/api/city'
import { addAddress, editAddress } from '@/api/address'

export default {
  name: 'AddressSelector',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    addressData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      form: {
        id: null,
        realName: '',
        phone: '',
        province: '',
        provinceId: null,
        city: '',
        cityId: null,
        district: '',
        districtId: null,
        detail: '',
        isDefault: false
      },
      regionValue: [],
      regionOptions: [],
      cascaderProps: {
        value: 'regionId',
        label: 'regionName',
        children: 'children',
        lazy: true,
        lazyLoad: this.loadRegionData
      },
      rules: {
        realName: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        regionText: [
          { required: true, message: '请选择所在地区', trigger: 'change' }
        ],
        detail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    value: {
      handler(val) {
        this.visible = val
        if (val) {
          this.initData()
        }
      },
      immediate: true
    },
    addressData: {
      handler(val) {
        if (val && val.id) {
          this.form = { ...val }
          this.regionValue = [val.provinceId, val.cityId, val.districtId].filter(Boolean)
        } else {
          this.resetForm()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async initData() {
      try {
        // 加载省份数据
        const response = await getProvinceList()
        if (response.code === 200) {
          this.regionOptions = response.data.map(item => ({
            ...item,
            leaf: false
          }))
        }
      } catch (error) {
        console.error('加载省份数据失败:', error)
      }
    },
    
    async loadRegionData(node, resolve) {
      const { level, value } = node
      
      try {
        let data = []
        
        if (level === 0) {
          // 加载省份
          const response = await getProvinceList()
          if (response.code === 200) {
            data = response.data.map(item => ({
              ...item,
              leaf: false
            }))
          }
        } else if (level === 1) {
          // 加载城市
          const response = await getCityList(value)
          if (response.code === 200) {
            data = response.data.map(item => ({
              ...item,
              leaf: false
            }))
          }
        } else if (level === 2) {
          // 加载区县
          const response = await getDistrictList(value)
          if (response.code === 200) {
            data = response.data.map(item => ({
              ...item,
              leaf: true // 区县是最后一级
            }))
          }
        }
        
        resolve(data)
      } catch (error) {
        console.error('加载地区数据失败:', error)
        resolve([])
      }
    },
    
    handleRegionChange(value) {
      if (value && value.length >= 3) {
        // 查找对应的地区名称
        this.findRegionNames(value)
      }
    },
    
    findRegionNames(regionIds) {
      // 从选项中查找对应的名称
      let province, city, district
      
      // 查找省份
      const provinceOption = this.regionOptions.find(item => item.regionId === regionIds[0])
      if (provinceOption) {
        province = provinceOption
        this.form.province = province.regionName
        this.form.provinceId = province.regionId
        
        // 查找城市
        const cityOption = provinceOption.children?.find(item => item.regionId === regionIds[1])
        if (cityOption) {
          city = cityOption
          this.form.city = city.regionName
          this.form.cityId = city.regionId
          
          // 查找区县
          const districtOption = cityOption.children?.find(item => item.regionId === regionIds[2])
          if (districtOption) {
            district = districtOption
            this.form.district = district.regionName
            this.form.districtId = district.regionId
          }
        }
      }
    },
    
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        
        this.loading = true
        
        const submitData = {
          ...this.form,
          street: '' // 街道字段，可选
        }
        
        if (this.form.id) {
          // 编辑地址
          await editAddress(submitData)
          this.$message.success('编辑地址成功')
        } else {
          // 新增地址
          await addAddress(submitData)
          this.$message.success('添加地址成功')
        }
        
        this.$emit('success')
        this.handleClose()
      } catch (error) {
        console.error('保存地址失败:', error)
        this.$message.error('保存地址失败')
      } finally {
        this.loading = false
      }
    },
    
    handleClose() {
      this.visible = false
      this.$emit('input', false)
      this.resetForm()
    },
    
    resetForm() {
      this.form = {
        id: null,
        realName: '',
        phone: '',
        province: '',
        provinceId: null,
        city: '',
        cityId: null,
        district: '',
        districtId: null,
        detail: '',
        isDefault: false
      }
      this.regionValue = []
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.address-selector {
  .dialog-footer {
    text-align: right;
  }
}
</style>
