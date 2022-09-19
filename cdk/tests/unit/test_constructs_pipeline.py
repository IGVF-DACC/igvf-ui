import pytest

from aws_cdk.assertions import Template


def test_constructs_pipeline_initialize_basic_self_updating_pipeline_construct(stack, secret, mocker, config):
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
            config=config,
        )
    )
    template = Template.from_stack(stack)
    import json
    print(json.dumps(template.to_json()))
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
                'Image': 'aws/codebuild/standard:5.0',
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


def test_constructs_pipeline_initialize_demo_deployment_pipeline_construct(mocker, config):
    from aws_cdk import Stack
    from aws_cdk import Environment
    from aws_cdk.aws_secretsmanager import Secret
    from aws_cdk.aws_chatbot import SlackChannelConfiguration
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
            config=config,
        )
    )
    template = Template.from_stack(stack)
    template.has_resource_properties(
        'AWS::CodePipeline::Pipeline',
        {
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
                                'StackName': 'igvf-ui-some-branch-DeployDevelopment-FrontendStack',
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
                                'TemplateConfiguration': 'SynthStep_Output::assembly-Default-TestDemoDeploymentPipeline-igvf-ui-some-branch-DeployDevelopment/TestDemoDeploymentPipelineigvfuisomebranchDeployDevelopmentFrontendStack0BA56E0B.template.json.config.json',
                                'ActionMode': 'CHANGE_SET_REPLACE',
                                'ChangeSetName': 'PipelineChange',
                                'TemplatePath': 'SynthStep_Output::assembly-Default-TestDemoDeploymentPipeline-igvf-ui-some-branch-DeployDevelopment/TestDemoDeploymentPipelineigvfuisomebranchDeployDevelopmentFrontendStack0BA56E0B.template.json'
                            },
                            'InputArtifacts': [
                                {
                                    'Name': 'SynthStep_Output'
                                }
                            ],
                            'Name': 'Prepare',
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
                                'StackName': 'igvf-ui-some-branch-DeployDevelopment-FrontendStack',
                                'ActionMode': 'CHANGE_SET_EXECUTE',
                                'ChangeSetName': 'PipelineChange'
                            },
                            'Name': 'Deploy',
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
                        }
                    ],
                    'Name': 'igvf-ui-some-branch-DeployDevelopment'
                }
            ],
            'ArtifactStore': {
                'Location': {
                    'Ref': 'TestDemoDeploymentPipelineArtifactsBucket08F7C193'
                },
                'Type': 'S3'
            },
            'RestartExecutionOnUpdate': True
        }
    )
