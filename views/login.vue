<template>
    <div class="login">
        <a-row style="height: 64px;-webkit-app-region: drag"><img src="../assets/logo.png" height="64" style="float: left;margin:24px 0 0 24px"/></a-row>
        <div class="login-form" style="-webkit-app-region: no-drag">
            <c-login @doLogin="doLogin" @resetPwd="showResetModal=true" @register="showRegisterModal=true"></c-login>
        </div>
        <c-register :visible.sync="showRegisterModal" @doRegister="doRegister"></c-register>
        <c-reset-pwd :visible.sync="showResetModal" @doResetPwd="doResetPwd" ></c-reset-pwd>
        <a-modal v-model="showOrganModal" :footer="null" :width="1024" :mask-closable="false" :closable="false" :body-style="{padding:0}">
            <a-card title="已加入组织" :bordered="false" :extra="user&&user.userName+',您好，欢迎使用'">
                <a-row v-if="organUsers.length>0" type="flex" justify="start">
                    <template v-for="organUser of organUsers">
                        <a-col span="4" style="padding: 0 10px 10px 0;min-width: 150px" :key="organUser._id">
                            <a title="点击进入系统" style="color: #000000;" @click="goWelcome(organUser)">
                                <div style="text-align: center">
                                    <a-row style="margin-bottom: 12px">
                                        <a-avatar shape="square" :size="80" :style="{backgroundColor:'#259ebf'}">
                                            <div style="margin: 12px;">
                                                <c-icon type="building-one" :size="56" fill="#fff" :strokeWidth="3"></c-icon>
                                            </div>
                                        </a-avatar>
                                    </a-row>
                                    <a-row class="text">
                                        <a-tooltip placement="bottom" :title="organUser.idOrgan.organName">
                                            {{ organUser.idOrgan.organName }}
                                        </a-tooltip>
                                    </a-row>
                                    <span style="color: #2D8cF0;font-size: 10px">{{ '[' + organUser.userType + ']' }}</span>
                                </div>
                            </a>
                        </a-col>
                    </template>
                </a-row>
                <a-empty description="暂未加入任何企业" v-else/>
            </a-card>
            <a-card title="更多操作" :bordered="false">
                <a-row>
                    <a-col span="4" style="padding: 0 10px 10px 0;min-width: 150px">
                        <a @click="Logout()" style="color: #000000;">
                            <div style="text-align: center">
                                <a-row style="margin-bottom: 24px">
                                    <a-avatar shape="square" :size="80" icon="poweroff" style="background-color:#ed4014"/>
                                </a-row>
                                <a-row>退出系统</a-row>
                            </div>
                        </a>
                    </a-col>
                    <a-col span="4" style="padding: 0 10px 10px 0;min-width: 150px">
                        <a @click="showCreateOrganModal = true" style="color: #000000;">
                            <div style="text-align: center">
                                <a-row style="margin-bottom: 24px">
                                    <a-avatar shape="square" :size="80" icon="team" style="background-color:#1890FF"/>
                                </a-row>
                                <a-row>创建组织</a-row>
                            </div>
                        </a>
                    </a-col>
                </a-row>
            </a-card>
        </a-modal>
        <a-modal v-model="showCreateOrganModal" title="组织创建" centered :mask-closable="false" :closable="false" dialogClass="noDrag" @ok="doRegisterOrgan">
            <a-form-model ref="form" labelAlign="left" :model="form" :rules="rule" :label-col="{span: 4}" :wrapper-col="{span: 20}">
                <a-form-model-item label="组织名称" prop="organName">
                    <a-input v-model="form.organName"/>
                </a-form-model-item>
            </a-form-model>
        </a-modal>
        <div style="width:100%;text-align:center;font-size: 14px;bottom: 12px;position: fixed;">© 2015-{{ new Date().getFullYear() }}</div>
    </div>
</template>
<script>
import {mapActions, mapGetters} from "vuex";

import CLogin from "../components/CLayout/components/CLogin"
import CRegister from "../components/CLayout/components/CRegister"
import CResetPwd from "../components/CLayout/components/CResetPwd"

export default {
    components: {CLogin, CRegister, CResetPwd},
    data() {
        const validateOrganNamePass = async (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入组织名称！'));
            } else {
                const count = await this.$clap.model('org_organ').get({params: {filter: {organName: value}}}).then(el => el.count)
                if (count) {
                    callback(new Error('该组织名称已存在!'));
                } else {
                    callback();
                }
            }
        };
        return {
            showOrganModal: false,
            showRegisterModal: false,
            showResetModal: false,
            showCreateOrganModal: false,
            form: {
                organName: '',
            },
            doLoginUser:{},
            rule: {
                organName: [{required: true, validator: validateOrganNamePass, trigger: 'change'}],
            },
            organUsers: [],
        };
    },
    created() {
        document.title = '系统登录';
        if (this.user) {
            this.getUserOrgans(this.user);
            this.showOrganModal = true;
        } else {
            this.$ls.remove('MENU');
        }
    },
    computed: {
        ...mapGetters(['user']),
    },
    methods: {
        ...mapActions(['Logout', 'SetUser','SetRole', 'SetToken', 'SetGroup', 'SetOrgan', 'ToggleMenu']),
        async doLogin(user) {
            user.userCode = user.userCode.trim();
            user.userPwd = user.userPwd.trim();
            this.doLoginUser = user;
            const result = await this.$clap.http.post(this.$clap.config.url.login, user);
            if (result.data.error.code === '0') {
                this.SetUser(result.data.record);
                await this.getUserOrgans(result.data.record._id);
                this.showOrganModal = true
            }
        },
        async doRegister(user) {
            const result = await this.$clap.http.post(this.$clap.config.url.register, user);
            if (result.data.error.code === '0') {
                this.$confirm({
                    title: '确认',
                    content: '恭喜,注册成功!是否立即登录？',
                    centered: true,
                    onOk: async () => {
                        this.SetUser(result.data.record);
                        await this.getUserOrgans(result.data.record._id);
                        this.showRegisterModal = false;
                        this.showOrganModal = true
                    }
                });
            }
        },
        async doResetPwd(user) {
            if(!user.userCode){
                user.userCode = this.doLoginUser.userCode
                user.userPwd = this.doLoginUser.userPwd
            }
            const result = await this.$clap.http.post(this.$clap.config.url.changePwd, user);
            if (result.data.error.code === '0') {
                this.$success({
                    title: '密码修改成功,请重新登录!', onOk: () => {
                        this.showResetModal = false;
                    }
                });
            }
        },
        async doRegisterOrgan() {
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    const result = await this.$clap.http.post(this.$clap.config.url.registerOrgan, {
                        ...this.form,
                        idUser: this.user._id
                    });
                    if (result.data.error.code === '0') {
                        this.showCreateOrganModal = false;
                        await this.getUserOrgans(this.user._id);
                    }
                }
            });
        },
        async getUserOrgans(idUser) {
            this.organUsers = await this.$clap.model('org_organ_user').get({
                params: {
                    filter: {idUser},
                    populate: 'idOrgan',
                    order: 'idOrgan'
                }
            }).then(res => {
                return res.records
            });
        },
        goWelcome(organUser) {
            this.SetToken(organUser._id);
            this.SetRole(organUser.userType);
            this.SetOrgan(organUser.idOrgan._id);
            this.ToggleMenu({key: 'dash', title: '首页', routeName: 'dash', controlType: 'Group', idOrgan: '', organs: [], closable: false});
        }
    }
};
</script>

<style lang="less">

@import "~ant-design-vue/es/style/themes/default.less";

.login {
    width: 100%;
    height: 100%;
    background-image: url('../assets/background.png');
    background-size: cover;
    background-position: center;

    &-form {
        position: absolute;
        right: 120px;
        top: 55%;
        transform: translateY(-60%);
        width: 450px;

        .form {
            padding: 0 20px;
        }
    }
}

.user-login-other {
    text-align: center;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
        font-size: 24px;
        color: rgba(0, 0, 0, 0.2);
        margin-left: 16px;
        vertical-align: middle;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: @primary-color;
        }
    }
}

.text {
    display: inline-block;
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
