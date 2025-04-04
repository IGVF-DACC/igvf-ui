import pytest

from aws_cdk.assertions import Template


def test_constructs_pipeline_initialize_basic_self_updating_pipeline_construct(stack, secret, mocker, pipeline_config):
    from infrastructure.constructs.pipeline import BasicSelfUpdatingPipeline
    from infrastructure.constructs.pipeline import BasicSelfUpdatingPipelineProps
    existing_resources = mocker.Mock()
    existing_resources.code_star_connection.arn = 'some-arn'
    existing_resources.docker_hub_credentials.secret = secret
    pipeline = BasicSelfUpdatingPipeline(
        stack,
        'TestBasicSelfUpdatingPipeline',
        props=BasicSelfUpdatingPipelineProps(
            github_repo='ABC/xyz',
            existing_resources=existing_resources,
            config=pipeline_config,
        )
    )
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CodePipeline::Pipeline',
        {
            'RoleArn': {
                'Fn::GetAtt': [
                    'TestBasicSelfUpdatingPipelineRole4F4987A1',
                    'Arn'
                ]
            },
            'Stages': [
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Source',
                                'Owner': 'AWS',
                                'Provider': 'CodeStarSourceConnection',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ConnectionArn': 'some-arn',
                                'FullRepositoryId': 'ABC/xyz',
                                'BranchName': 'some-branch'
                            },
                            'Name': 'ABC_xyz',
                            'OutputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestBasicSelfUpdatingPipelineSourceABCxyzCodePipelineActionRoleBC7A6C81',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Source'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestBasicSelfUpdatingPipelineBuildSynthStepCdkBuildProjectFA8DA9FD'
                                },
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'Name': 'SynthStep',
                            'OutputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestBasicSelfUpdatingPipelineCodePipelineCodeBuildActionRole47BC97B6',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Build'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestBasicSelfUpdatingPipelineCodePipelineUpdatePipelineSelfMutationCFEBBD4C'
                                },
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'SelfMutate',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestBasicSelfUpdatingPipelineCodePipelineCodeBuildActionRole47BC97B6',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'UpdatePipeline'
                }
            ],
            'ArtifactStore': {
                'Location': {
                    'Ref': 'TestBasicSelfUpdatingPipelineArtifactsBucketEEE5B598'
                },
                'Type': 'S3'
            },
            'RestartExecutionOnUpdate': True
        }
    )
    template.has_resource_properties(
        'AWS::CodeBuild::Project',
        {
            'Artifacts': {
                'Type': 'CODEPIPELINE'
            },
            'Environment': {
                'ComputeType': 'BUILD_GENERAL1_SMALL',
                'EnvironmentVariables': [
                    {
                        'Name': 'CONFIG_NAME',
                        'Type': 'PLAINTEXT',
                        'Value': 'demo'
                    },
                    {
                        'Name': 'BRANCH',
                        'Type': 'PLAINTEXT',
                        'Value': 'some-branch'
                    }
                ],
                'Image': 'aws/codebuild/standard:7.0',
                'ImagePullCredentialsType': 'CODEBUILD',
                'PrivilegedMode': True,
                'Type': 'LINUX_CONTAINER'
            },
            'ServiceRole': {
                'Fn::GetAtt': [
                    'TestBasicSelfUpdatingPipelineBuildSynthStepCdkBuildProjectRoleF66D862F',
                    'Arn'
                ]
            },
            'Source': {
                'Type': 'CODEPIPELINE'
            },
            'Cache': {
                'Type': 'NO_CACHE'
            },
            'Description': 'Pipeline step Default/Pipeline/Build/SynthStep',
            'EncryptionKey': 'alias/aws/s3'
        }
    )
    template.has_resource_properties(
        'AWS::IAM::Policy',
        {
            'PolicyDocument': {
                'Statement': [
                    {
                        'Action': [
                            's3:GetObject*',
                            's3:GetBucket*',
                            's3:List*',
                            's3:DeleteObject*',
                            's3:PutObject',
                            's3:PutObjectLegalHold',
                            's3:PutObjectRetention',
                            's3:PutObjectTagging',
                            's3:PutObjectVersionTagging',
                            's3:Abort*'
                        ],
                        'Effect': 'Allow',
                        'Resource': [
                            {
                                'Fn::GetAtt': [
                                    'TestBasicSelfUpdatingPipelineArtifactsBucketEEE5B598',
                                    'Arn'
                                ]
                            },
                            {
                                'Fn::Join': [
                                    '',
                                    [
                                        {
                                            'Fn::GetAtt': [
                                                'TestBasicSelfUpdatingPipelineArtifactsBucketEEE5B598',
                                                'Arn'
                                            ]
                                        },
                                        '/*'
                                    ]
                                ]
                            }
                        ]
                    },
                    {
                        'Action': 'sts:AssumeRole',
                        'Effect': 'Allow',
                        'Resource': {
                            'Fn::GetAtt': [
                                'TestBasicSelfUpdatingPipelineSourceABCxyzCodePipelineActionRoleBC7A6C81',
                                'Arn'
                            ]
                        }
                    },
                    {
                        'Action': 'sts:AssumeRole',
                        'Effect': 'Allow',
                        'Resource': {
                            'Fn::GetAtt': [
                                'TestBasicSelfUpdatingPipelineCodePipelineCodeBuildActionRole47BC97B6',
                                'Arn'
                            ]
                        }
                    }
                ],
                'Version': '2012-10-17'
            },
            'PolicyName': 'TestBasicSelfUpdatingPipelineRoleDefaultPolicyF0137E8F',
            'Roles': [
                {
                    'Ref': 'TestBasicSelfUpdatingPipelineRole4F4987A1'
                }
            ]
        }
    )
    template.resource_count_is(
        'AWS::CodeBuild::Project',
        2
    )


def test_constructs_pipeline_initialize_demo_deployment_pipeline_construct(mocker, pipeline_config):
    from aws_cdk import Stack
    from aws_cdk.aws_secretsmanager import Secret
    from aws_cdk.aws_chatbot import SlackChannelConfiguration
    from infrastructure.config import Config
    from infrastructure.constructs.pipeline import DemoDeploymentPipeline
    from infrastructure.constructs.pipeline import DemoDeploymentPipelineProps
    from infrastructure.constructs.existing import igvf_dev
    stack = Stack(
        env=igvf_dev.US_WEST_2
    )
    existing_resources = mocker.Mock()
    existing_resources.code_star_connection.arn = 'some-arn'
    existing_resources.docker_hub_credentials.secret = Secret(
        stack,
        'TestSecret',
    )
    existing_resources.notification.encode_dcc_chatbot = SlackChannelConfiguration(
        stack,
        'TestChatbot',
        slack_channel_configuration_name='some-config-name',
        slack_channel_id='some-channel-id',
        slack_workspace_id='some-workspace-id',
    )
    pipeline = DemoDeploymentPipeline(
        stack,
        'TestDemoDeploymentPipeline',
        props=DemoDeploymentPipelineProps(
            github_repo='ABC/xyz',
            existing_resources=existing_resources,
            config=pipeline_config,
        )
    )
    assert isinstance(pipeline.demo_config, Config)
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CodePipeline::Pipeline',
        {
            'ArtifactStore': {
                'Location': {
                    'Ref': 'TestDemoDeploymentPipelineArtifactsBucket08F7C193'
                },
                'Type': 'S3'
            },
            'RestartExecutionOnUpdate': True,
            'RoleArn': {
                'Fn::GetAtt': [
                    'TestDemoDeploymentPipelineRole9CDEC6AA',
                    'Arn'
                ]
            },
            'Stages': [
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Source',
                                'Owner': 'AWS',
                                'Provider': 'CodeStarSourceConnection',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ConnectionArn': 'some-arn',
                                'FullRepositoryId': 'ABC/xyz',
                                'BranchName': 'some-branch'
                            },
                            'Name': 'ABC_xyz',
                            'OutputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestDemoDeploymentPipelineSourceABCxyzCodePipelineActionRole9842C8B6',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Source'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestDemoDeploymentPipelineBuildSynthStepCdkBuildProject6B563FFC'
                                },
                                'EnvironmentVariables': "[{\"name\":\"_PROJECT_CONFIG_HASH\",\"type\":\"PLAINTEXT\",\"value\":\"fc10ea4e00d0346284fc61dc2135b21b97f6a86a10c7db74c4aad561921e8338\"}]"
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'Name': 'SynthStep',
                            'OutputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestDemoDeploymentPipelineCodePipelineCodeBuildActionRoleD3A8E8C4',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Build'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestDemoDeploymentPipelineCodePipelineUpdatePipelineSelfMutation212B9375'
                                },
                                'EnvironmentVariables': "[{\"name\":\"_PROJECT_CONFIG_HASH\",\"type\":\"PLAINTEXT\",\"value\":\"dcc6af4aeca83e1ca85ddbe307757885c1e45ca2d4437e165c2a7a11f5ee1835\"}]"
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'SelfMutate',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestDemoDeploymentPipelineCodePipelineCodeBuildActionRoleD3A8E8C4',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'UpdatePipeline'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestDemoDeploymentPipelineCodePipelineAssetsDockerAsset103B4C497'
                                }
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'DockerAsset1',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestDemoDeploymentPipelineCodePipelineCodeBuildActionRoleD3A8E8C4',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestDemoDeploymentPipelineCodePipelineAssetsDockerAsset226FE0B63'
                                }
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'DockerAsset2',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestDemoDeploymentPipelineCodePipelineCodeBuildActionRoleD3A8E8C4',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Assets'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DemoDeployStage-RedisStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::109189702753:role/cdk-hnb659fds-cfn-exec-role-109189702753-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestDemoDeploymentPipeline-igvf-ui-some-branch-DemoDeployStage/TestDemoDeploymentPipelineigvfuisomebranchDemoDeployStageRedisStack8311790F.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestDemoDeploymentPipeline-igvf-ui-some-branch-DemoDeployStage/TestDemoDeploymentPipelineigvfuisomebranchDemoDeployStageRedisStack8311790F.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'RedisStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DemoDeployStage-RedisStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'RedisStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 2
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DemoDeployStage-FrontendStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::109189702753:role/cdk-hnb659fds-cfn-exec-role-109189702753-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestDemoDeploymentPipeline-igvf-ui-some-branch-DemoDeployStage/TestDemoDeploymentPipelineigvfuisomebranchDemoDeployStageFrontendStack04E16543.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestDemoDeploymentPipeline-igvf-ui-some-branch-DemoDeployStage/TestDemoDeploymentPipelineigvfuisomebranchDemoDeployStageFrontendStack04E16543.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'FrontendStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 3
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DemoDeployStage-FrontendStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'FrontendStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 4
                        }
                    ],
                    'Name': 'igvf-ui-some-branch-DemoDeployStage'
                }
            ]
        }
    )


def test_constructs_pipeline_initialize_dev_deployment_pipeline_construct(mocker, pipeline_config):
    from aws_cdk import Stack
    from aws_cdk.aws_secretsmanager import Secret
    from aws_cdk.aws_chatbot import SlackChannelConfiguration
    from infrastructure.config import Config
    from infrastructure.constructs.pipeline import DevDeploymentPipeline
    from infrastructure.constructs.pipeline import DevDeploymentPipelineProps
    from infrastructure.constructs.existing import igvf_dev
    stack = Stack(
        env=igvf_dev.US_WEST_2
    )
    existing_resources = mocker.Mock()
    existing_resources.code_star_connection.arn = 'some-arn'
    existing_resources.docker_hub_credentials.secret = Secret(
        stack,
        'TestSecret',
    )
    existing_resources.notification.encode_dcc_chatbot = SlackChannelConfiguration(
        stack,
        'TestChatbot',
        slack_channel_configuration_name='some-config-name',
        slack_channel_id='some-channel-id',
        slack_workspace_id='some-workspace-id',
    )
    pipeline = DevDeploymentPipeline(
        stack,
        'DevDeploymentPipeline',
        props=DevDeploymentPipelineProps(
            github_repo='ABC/xyz',
            existing_resources=existing_resources,
            config=pipeline_config,
        )
    )
    assert isinstance(pipeline.dev_config, Config)
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CodePipeline::Pipeline',
        {
            'ArtifactStore': {
                'Location': {
                    'Ref': 'DevDeploymentPipelineArtifactsBucket0684E092'
                },
                'Type': 'S3'
            },
            'RestartExecutionOnUpdate': True,
            'RoleArn': {
                'Fn::GetAtt': [
                    'DevDeploymentPipelineRole49B33515',
                    'Arn'
                ]
            },
            'Stages': [
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Source',
                                'Owner': 'AWS',
                                'Provider': 'CodeStarSourceConnection',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ConnectionArn': 'some-arn',
                                'FullRepositoryId': 'ABC/xyz',
                                'BranchName': 'some-branch'
                            },
                            'Name': 'ABC_xyz',
                            'OutputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'DevDeploymentPipelineSourceABCxyzCodePipelineActionRole9EAA1D81',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Source'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'DevDeploymentPipelineBuildSynthStepCdkBuildProject2CD3821E'
                                },
                                'EnvironmentVariables': "[{\"name\":\"_PROJECT_CONFIG_HASH\",\"type\":\"PLAINTEXT\",\"value\":\"fc10ea4e00d0346284fc61dc2135b21b97f6a86a10c7db74c4aad561921e8338\"}]"
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'Name': 'SynthStep',
                            'OutputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'DevDeploymentPipelineCodePipelineCodeBuildActionRole393D1655',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Build'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'DevDeploymentPipelineCodePipelineUpdatePipelineSelfMutation49276B8C'
                                },
                                'EnvironmentVariables': "[{\"name\":\"_PROJECT_CONFIG_HASH\",\"type\":\"PLAINTEXT\",\"value\":\"dcc6af4aeca83e1ca85ddbe307757885c1e45ca2d4437e165c2a7a11f5ee1835\"}]"
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'SelfMutate',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'DevDeploymentPipelineCodePipelineCodeBuildActionRole393D1655',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'UpdatePipeline'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'DevDeploymentPipelineCodePipelineAssetsDockerAsset11CFF4D00'
                                }
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'DockerAsset1',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'DevDeploymentPipelineCodePipelineCodeBuildActionRole393D1655',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'DevDeploymentPipelineCodePipelineAssetsDockerAsset2845D1B67'
                                }
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'DockerAsset2',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'DevDeploymentPipelineCodePipelineCodeBuildActionRole393D1655',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Assets'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DevelopmentDeployStage-RedisStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::109189702753:role/cdk-hnb659fds-cfn-exec-role-109189702753-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-DevDeploymentPipeline-igvf-ui-some-branch-DevelopmentDeployStage/DevDeploymentPipelineigvfuisomebranchDevelopmentDeployStageRedisStack326EB249.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-DevDeploymentPipeline-igvf-ui-some-branch-DevelopmentDeployStage/DevDeploymentPipelineigvfuisomebranchDevelopmentDeployStageRedisStack326EB249.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'RedisStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DevelopmentDeployStage-RedisStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'RedisStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 2
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DevelopmentDeployStage-FrontendStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::109189702753:role/cdk-hnb659fds-cfn-exec-role-109189702753-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-DevDeploymentPipeline-igvf-ui-some-branch-DevelopmentDeployStage/DevDeploymentPipelineigvfuisomebranchDevelopmentDeployStageFrontendStack52BCA050.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-DevDeploymentPipeline-igvf-ui-some-branch-DevelopmentDeployStage/DevDeploymentPipelineigvfuisomebranchDevelopmentDeployStageFrontendStack52BCA050.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'FrontendStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 3
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-DevelopmentDeployStage-FrontendStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'FrontendStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::109189702753:role/cdk-hnb659fds-deploy-role-109189702753-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 4
                        }
                    ],
                    'Name': 'igvf-ui-some-branch-DevelopmentDeployStage'
                }
            ]
        }
    )


def test_constructs_pipeline_initialize_production_deployment_pipeline_construct(mocker, production_pipeline_config):
    from aws_cdk import Stack
    from aws_cdk.aws_secretsmanager import Secret
    from aws_cdk.aws_chatbot import SlackChannelConfiguration
    from infrastructure.config import Config
    from infrastructure.constructs.pipeline import ProductionDeploymentPipeline
    from infrastructure.constructs.pipeline import ProductionDeploymentPipelineProps
    from infrastructure.constructs.existing import igvf_dev
    stack = Stack(
        env=igvf_dev.US_WEST_2
    )
    existing_resources = mocker.Mock()
    existing_resources.code_star_connection.arn = 'some-arn'
    existing_resources.docker_hub_credentials.secret = Secret(
        stack,
        'TestSecret',
    )
    existing_resources.notification.encode_dcc_chatbot = SlackChannelConfiguration(
        stack,
        'TestChatbot',
        slack_channel_configuration_name='some-config-name',
        slack_channel_id='some-channel-id',
        slack_workspace_id='some-workspace-id',
    )
    pipeline = ProductionDeploymentPipeline(
        stack,
        'TestProductionDeploymentPipeline',
        props=ProductionDeploymentPipelineProps(
            github_repo='ABC/xyz',
            existing_resources=existing_resources,
            config=production_pipeline_config,
        )
    )
    assert isinstance(pipeline.staging_config, Config)
    assert isinstance(pipeline.sandbox_config, Config)
    assert isinstance(pipeline.production_config, Config)
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CodePipeline::Pipeline',
        {
            'ArtifactStore': {
                'EncryptionKey': {
                    'Id': {
                        'Fn::GetAtt': [
                            'TestProductionDeploymentPipelineArtifactsBucketEncryptionKeyE13B70EA',
                            'Arn'
                        ]
                    },
                    'Type': 'KMS'
                },
                'Location': {
                    'Ref': 'TestProductionDeploymentPipelineArtifactsBucketE2532ECB'
                },
                'Type': 'S3'
            },
            'RestartExecutionOnUpdate': True,
            'RoleArn': {
                'Fn::GetAtt': [
                    'TestProductionDeploymentPipelineRole9747ED35',
                    'Arn'
                ]
            },
            'Stages': [
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Source',
                                'Owner': 'AWS',
                                'Provider': 'CodeStarSourceConnection',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ConnectionArn': 'some-arn',
                                'FullRepositoryId': 'ABC/xyz',
                                'BranchName': 'some-branch'
                            },
                            'Name': 'ABC_xyz',
                            'OutputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestProductionDeploymentPipelineSourceABCxyzCodePipelineActionRole2B341539',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Source'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestProductionDeploymentPipelineBuildSynthStepCdkBuildProjectF1FF1A53'
                                },
                                'EnvironmentVariables': "[{\"name\":\"_PROJECT_CONFIG_HASH\",\"type\":\"PLAINTEXT\",\"value\":\"b6bd22975ddd6042d61d6940b96da54a552cdbb86fdf7ef6a76ede0a6b59427e\"}]"
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'ABC_xyz_Source'
                                }
                            ],
                            'Name': 'SynthStep',
                            'OutputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestProductionDeploymentPipelineCodePipelineCodeBuildActionRole650FEAB8',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Build'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestProductionDeploymentPipelineCodePipelineUpdatePipelineSelfMutation7B8F4173'
                                },
                                'EnvironmentVariables': "[{\"name\":\"_PROJECT_CONFIG_HASH\",\"type\":\"PLAINTEXT\",\"value\":\"dcc6af4aeca83e1ca85ddbe307757885c1e45ca2d4437e165c2a7a11f5ee1835\"}]"
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'SelfMutate',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestProductionDeploymentPipelineCodePipelineCodeBuildActionRole650FEAB8',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'UpdatePipeline'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestProductionDeploymentPipelineCodePipelineAssetsDockerAsset15D7C753F'
                                }
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'DockerAsset1',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestProductionDeploymentPipelineCodePipelineCodeBuildActionRole650FEAB8',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Build',
                                'Owner': 'AWS',
                                'Provider': 'CodeBuild',
                                'Version': '1'
                            },
                            'Configuration': {
                                'ProjectName': {
                                    'Ref': 'TestProductionDeploymentPipelineCodePipelineAssetsDockerAsset25EFC821F'
                                }
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'DockerAsset2',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestProductionDeploymentPipelineCodePipelineCodeBuildActionRole650FEAB8',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        }
                    ],
                    'Name': 'Assets'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-StagingDeployStage-RedisStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::920073238245:role/cdk-hnb659fds-cfn-exec-role-920073238245-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-StagingDeployStage/TestProductionDeploymentPipelineigvfuisomebranchStagingDeployStageRedisStack8B7AD51A.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-StagingDeployStage/TestProductionDeploymentPipelineigvfuisomebranchStagingDeployStageRedisStack8B7AD51A.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'RedisStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-StagingDeployStage-RedisStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'RedisStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 2
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-StagingDeployStage-FrontendStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::920073238245:role/cdk-hnb659fds-cfn-exec-role-920073238245-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-StagingDeployStage/TestProductionDeploymentPipelineigvfuisomebranchStagingDeployStageFrontendStackBEA4A41D.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-StagingDeployStage/TestProductionDeploymentPipelineigvfuisomebranchStagingDeployStageFrontendStackBEA4A41D.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'FrontendStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 3
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-StagingDeployStage-FrontendStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'FrontendStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 4
                        }
                    ],
                    'Name': 'igvf-ui-some-branch-StagingDeployStage'
                },
                {
                    'Actions': [
                        {
                            'ActionTypeId': {
                                'Category': 'Approval',
                                'Owner': 'AWS',
                                'Provider': 'Manual',
                                'Version': '1'
                            },
                            'Name': 'ProductionDeploymentManualApprovalStep',
                            'RoleArn': {
                                'Fn::GetAtt': [
                                    'TestProductionDeploymentPipelineProductionAndSandboxDeployWaveProductionDeploymentManualApprovalStepCodePipelineActionRoleA138A3B5',
                                    'Arn'
                                ]
                            },
                            'RunOrder': 1
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-SandboxDeployStage-RedisStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::920073238245:role/cdk-hnb659fds-cfn-exec-role-920073238245-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-SandboxDeployStage/TestProductionDeploymentPipelineigvfuisomebranchSandboxDeployStageRedisStack9CE955A2.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-SandboxDeployStage/TestProductionDeploymentPipelineigvfuisomebranchSandboxDeployStageRedisStack9CE955A2.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'igvf-ui-some-branch-SandboxDeployStage.RedisStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 2
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-ProductionDeployStage-RedisStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::035226225042:role/cdk-hnb659fds-cfn-exec-role-035226225042-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-ProductionDeployStage/TestProductionDeploymentPipelineigvfuisomebranchProductionDeployStageRedisStack8AEF78FE.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-ProductionDeployStage/TestProductionDeploymentPipelineigvfuisomebranchProductionDeployStageRedisStack8AEF78FE.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'igvf-ui-some-branch-ProductionDeployStage.RedisStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::035226225042:role/cdk-hnb659fds-deploy-role-035226225042-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 2
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-SandboxDeployStage-RedisStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'igvf-ui-some-branch-SandboxDeployStage.RedisStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 3
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-ProductionDeployStage-RedisStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'igvf-ui-some-branch-ProductionDeployStage.RedisStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::035226225042:role/cdk-hnb659fds-deploy-role-035226225042-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 3
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-SandboxDeployStage-FrontendStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::920073238245:role/cdk-hnb659fds-cfn-exec-role-920073238245-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-SandboxDeployStage/TestProductionDeploymentPipelineigvfuisomebranchSandboxDeployStageFrontendStack6AA1A1D2.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-SandboxDeployStage/TestProductionDeploymentPipelineigvfuisomebranchSandboxDeployStageFrontendStack6AA1A1D2.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'igvf-ui-some-branch-SandboxDeployStage.FrontendStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 4
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-ProductionDeployStage-FrontendStack',
                                'Capabilities': 'CAPABILITY_NAMED_IAM,CAPABILITY_AUTO_EXPAND',
                                'RoleArn': {
                                    'Fn::Join': [
                                        '',
                                        [
                                            'arn:',
                                            {
                                                'Ref': 'AWS::Partition'
                                            },
                                            ':iam::035226225042:role/cdk-hnb659fds-cfn-exec-role-035226225042-us-west-2'
                                        ]
                                    ]
                                },
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-ProductionDeployStage/TestProductionDeploymentPipelineigvfuisomebranchProductionDeployStageFrontendStack4E5DDAEC.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestProductionDeploymentPipeline-igvf-ui-some-branch-ProductionDeployStage/TestProductionDeploymentPipelineigvfuisomebranchProductionDeployStageFrontendStack4E5DDAEC.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'igvf-ui-some-branch-ProductionDeployStage.FrontendStack.Prepare',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::035226225042:role/cdk-hnb659fds-deploy-role-035226225042-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 4
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-SandboxDeployStage-FrontendStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'igvf-ui-some-branch-SandboxDeployStage.FrontendStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::920073238245:role/cdk-hnb659fds-deploy-role-920073238245-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 5
                        },
                        {
                            'ActionTypeId': {
                                'Category': 'Deploy',
                                'Owner': 'AWS',
                                'Provider': 'CloudFormation',
                                'Version': '1'
                            },
                            'Configuration': {
                                'StackName': 'igvf-ui-some-branch-ProductionDeployStage-FrontendStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'igvf-ui-some-branch-ProductionDeployStage.FrontendStack.Deploy',
                            'RoleArn': {
                                'Fn::Join': [
                                    '',
                                    [
                                        'arn:',
                                        {
                                            'Ref': 'AWS::Partition'
                                        },
                                        ':iam::035226225042:role/cdk-hnb659fds-deploy-role-035226225042-us-west-2'
                                    ]
                                ]
                            },
                            'RunOrder': 5
                        }
                    ],
                    'Name': 'ProductionAndSandboxDeployWave'
                }
            ]
        }
    )
