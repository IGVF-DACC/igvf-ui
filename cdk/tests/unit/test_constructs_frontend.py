import pytest

from aws_cdk.assertions import Template


def test_constructs_frontend_initialize_frontend_construct(stack, instance_type, existing_resources, vpc, config):
    from infrastructure.constructs.frontend import Frontend
    from infrastructure.constructs.frontend import FrontendProps
    frontend = Frontend(
        stack,
        'TestFrontend',
        props=FrontendProps(
            config=config,
            existing_resources=existing_resources,
            cpu=2048,
            memory_limit_mib=4096,
            desired_count=4,
            max_capacity=7,
        )
    )
    template = Template.from_stack(stack)
    # Then
    template.resource_count_is(
        'AWS::ECS::Cluster',
        1
    )
    template.has_resource_properties(
        'AWS::ECS::TaskDefinition',
        {
            'ContainerDefinitions': [
                {
                    'Essential': True,
                    'LogConfiguration': {
                        'LogDriver': 'awslogs',
                        'Options': {
                            'awslogs-group': {
                                'Ref': 'TestFrontendFargateTaskDefnginxfeLogGroupEB332E29'
                            },
                            'awslogs-stream-prefix': 'nginxfe',
                            'awslogs-region': {
                                'Ref': 'AWS::Region'
                            },
                            'mode': 'non-blocking'
                        }
                    },
                    'Name': 'nginxfe',
                    'PortMappings': [
                        {
                            'ContainerPort': 80,
                            'Protocol': 'tcp'
                        }
                    ]
                },
                {
                    'Environment': [
                        {
                            'Name': 'NODE_ENV',
                            'Value': 'production'
                        },
                        {
                            'Name': 'BACKEND_URL',
                            'Value': 'https://igvfd-some-test-backend.demo.igvf.org'
                        }
                    ],
                    'Essential': True,
                    'LogConfiguration': {
                        'LogDriver': 'awslogs',
                        'Options': {
                            'awslogs-group': {
                                'Ref': 'TestFrontendFargateTaskDefApplicationContainerLogGroupB905B11F'
                            },
                            'awslogs-stream-prefix': 'nextjs',
                            'awslogs-region': {
                                'Ref': 'AWS::Region'
                            },
                            'mode': 'non-blocking'
                        }
                    },
                    'Name': 'nextjs'
                }
            ],
            'Cpu': '2048',
            'ExecutionRoleArn': {
                'Fn::GetAtt': [
                    'TestFrontendFargateTaskDefExecutionRoleA7F6270B',
                    'Arn'
                ]
            },
            'Family': 'TestFrontendFargateTaskDef851C82A9',
            'Memory': '4096',
            'NetworkMode': 'awsvpc',
            'RequiresCompatibilities': [
                'FARGATE'
            ],
            'Tags': [
                {
                    'Key': 'backend_url',
                    'Value': 'https://igvfd-some-test-backend.demo.igvf.org'
                },
                {
                    'Key': 'branch',
                    'Value': 'some-branch'
                }
            ],
            'TaskRoleArn': {
                'Fn::GetAtt': [
                    'TestFrontendFargateTaskDefTaskRole92D4E800',
                    'Arn'
                ]
            }
        }
    )
    template.has_resource_properties(
        'AWS::ECS::Service',
        {
            'Cluster': {
                'Ref': 'EcsDefaultClusterMnL3mNNYNTestVpc4872C696'
            },
            'DeploymentConfiguration': {
                'DeploymentCircuitBreaker': {
                    'Enable': True,
                    'Rollback': True
                },
                'MaximumPercent': 200,
                'MinimumHealthyPercent': 50
            },
            'DeploymentController': {
                'Type': 'ECS'
            },
            'DesiredCount': 4,
            'EnableECSManagedTags': False,
            'EnableExecuteCommand': True,
            'HealthCheckGracePeriodSeconds': 60,
            'LaunchType': 'FARGATE',
            'LoadBalancers': [
                {
                    'ContainerName': 'nginxfe',
                    'ContainerPort': 80,
                    'TargetGroupArn': {
                        'Ref': 'TestFrontendFargateLBPublicListenerECSGroup92AD1119'
                    }
                }
            ],
            'NetworkConfiguration': {
                'AwsvpcConfiguration': {
                    'AssignPublicIp': 'ENABLED',
                    'SecurityGroups': [
                        {
                            'Fn::GetAtt': [
                                'TestFrontendFargateServiceSecurityGroup9DFF92D3',
                                'GroupId'
                            ]
                        }
                    ],
                    'Subnets': [
                        {
                            'Ref': 'TestVpcpublicSubnet1Subnet4F70BC85'
                        },
                        {
                            'Ref': 'TestVpcpublicSubnet2Subnet96FF72E6'
                        }
                    ]
                }
            },
            'ServiceName': 'Frontend',
            'Tags': [
                {
                    'Key': 'backend_url',
                    'Value': 'https://igvfd-some-test-backend.demo.igvf.org'
                },
                {
                    'Key': 'branch',
                    'Value': 'some-branch'
                }
            ],
            'TaskDefinition': {
                'Ref': 'TestFrontendFargateTaskDef5DCA46EA'
            }
        }
    )
    template.has_resource_properties(
        'AWS::ElasticLoadBalancingV2::LoadBalancer',
        {
            'LoadBalancerAttributes': [
                {
                    'Key': 'deletion_protection.enabled',
                    'Value': 'false'
                }
            ],
            'Scheme': 'internet-facing',
            'SecurityGroups': [
                {
                    'Fn::GetAtt': [
                        'TestFrontendFargateLBSecurityGroup70BD6524',
                        'GroupId'
                    ]
                }
            ],
            'Subnets': [
                {
                    'Ref': 'TestVpcpublicSubnet1Subnet4F70BC85'
                },
                {
                    'Ref': 'TestVpcpublicSubnet2Subnet96FF72E6'
                }
            ],
            'Tags': [
                {
                    'Key': 'backend_url',
                    'Value': 'https://igvfd-some-test-backend.demo.igvf.org'
                },
                {
                    'Key': 'branch',
                    'Value': 'some-branch'
                }
            ],
            'Type': 'application'
        }
    )
    template.has_resource_properties(
        'AWS::EC2::SecurityGroup',
        {
            'GroupDescription': 'Automatically created Security Group for ELB TestFrontendFargateLBBA7BDAE2',
            'SecurityGroupIngress': [
                {
                    'CidrIp': '0.0.0.0/0',
                    'Description': 'Allow from anyone on port 443',
                    'FromPort': 443,
                    'IpProtocol': 'tcp',
                    'ToPort': 443
                },
                {
                    'CidrIp': '0.0.0.0/0',
                    'Description': 'Allow from anyone on port 80',
                    'FromPort': 80,
                    'IpProtocol': 'tcp',
                    'ToPort': 80
                }
            ],
            'Tags': [
                {
                    'Key': 'backend_url',
                    'Value': 'https://igvfd-some-test-backend.demo.igvf.org'
                },
                {
                    'Key': 'branch',
                    'Value': 'some-branch'
                }
            ],
            'VpcId': {
                'Ref': 'TestVpcE77CE678'
            }
        }
    )
    template.has_resource_properties(
        'AWS::EC2::SecurityGroupEgress',
        {
            'GroupId': {
                'Fn::GetAtt': [
                    'TestFrontendFargateLBSecurityGroup70BD6524',
                    'GroupId'
                ]
            },
            'IpProtocol': 'tcp',
            'Description': 'Load balancer to target',
            'DestinationSecurityGroupId': {
                'Fn::GetAtt': [
                    'TestFrontendFargateServiceSecurityGroup9DFF92D3',
                    'GroupId'
                ]
            },
            'FromPort': 80,
            'ToPort': 80
        }
    )
    template.has_resource_properties(
        'AWS::ElasticLoadBalancingV2::Listener',
        {
            'DefaultActions': [
                {
                    'TargetGroupArn': {
                        'Ref': 'TestFrontendFargateLBPublicListenerECSGroup92AD1119'
                    },
                    'Type': 'forward'
                }
            ],
            'LoadBalancerArn': {
                'Ref': 'TestFrontendFargateLBCE1681DE',
            },
            'Certificates': [
                {
                    'CertificateArn': {
                        'Ref': 'TestCertificate6B4956B6'
                    }
                }
            ],
            'Port': 443,
            'Protocol': 'HTTPS'
        }
    )
    template.has_resource_properties(
        'AWS::ElasticLoadBalancingV2::Listener',
        {
            'DefaultActions': [
                {
                    'RedirectConfig': {
                        'Port': '443',
                        'Protocol': 'HTTPS',
                        'StatusCode': 'HTTP_301'
                    },
                    'Type': 'redirect'
                }
            ],
            'LoadBalancerArn': {
                'Ref': 'TestFrontendFargateLBCE1681DE'
            },
            'Port': 80,
            'Protocol': 'HTTP'
        }
    )
    template.has_resource_properties(
        'AWS::IAM::Policy',
        {
            'PolicyDocument': {
                'Statement': [
                    {
                        'Action': [
                            'ecr:BatchCheckLayerAvailability',
                            'ecr:GetDownloadUrlForLayer',
                            'ecr:BatchGetImage'
                        ],
                        'Effect': 'Allow',
                        'Resource': {
                            'Fn::Join': [
                                '',
                                [
                                    'arn:',
                                    {
                                        'Ref': 'AWS::Partition'
                                    },
                                    ':ecr:',
                                    {
                                        'Ref': 'AWS::Region'
                                    },
                                    ':',
                                    {
                                        'Ref': 'AWS::AccountId'
                                    },
                                    ':repository/',
                                    {
                                        'Fn::Sub': 'cdk-hnb659fds-container-assets-${AWS::AccountId}-${AWS::Region}'
                                    }
                                ]
                            ]
                        }
                    },
                    {
                        'Action': 'ecr:GetAuthorizationToken',
                        'Effect': 'Allow',
                        'Resource': '*'
                    },
                    {
                        'Action': [
                            'logs:CreateLogStream',
                            'logs:PutLogEvents'
                        ],
                        'Effect': 'Allow',
                        'Resource': {
                            'Fn::GetAtt': [
                                'TestFrontendFargateTaskDefnginxfeLogGroupEB332E29',
                                'Arn'
                            ]
                        }
                    },
                    {
                        'Action': [
                            'logs:CreateLogStream',
                            'logs:PutLogEvents'
                        ],
                        'Effect': 'Allow',
                        'Resource': {
                            'Fn::GetAtt': [
                                'TestFrontendFargateTaskDefApplicationContainerLogGroupB905B11F',
                                'Arn'
                            ]
                        }
                    }
                ],
                'Version': '2012-10-17'
            },
            'PolicyName': 'TestFrontendFargateTaskDefExecutionRoleDefaultPolicy56C21625',
            'Roles': [
                {
                    'Ref': 'TestFrontendFargateTaskDefExecutionRoleA7F6270B'
                }
            ]
        }
    )


def test_constructs_frontend_frontend_define_domain_name(stack, instance_type, existing_resources, vpc, config):
    from dataclasses import asdict
    from infrastructure.config import Config
    from infrastructure.constructs.frontend import Frontend
    from infrastructure.constructs.frontend import FrontendProps
    frontend = Frontend(
        stack,
        'TestFrontend',
        props=FrontendProps(
            config=config,
            existing_resources=existing_resources,
            cpu=2048,
            memory_limit_mib=4096,
            desired_count=4,
            max_capacity=7,
        )
    )
    assert frontend.domain_name == 'igvf-ui-some-branch.my.test.domain.org'
    old_config = {
        k: v
        for k, v in asdict(config).items()
        if k != 'common'
    }
    config_with_prefix = Config(
        **{
            **old_config,
            **{
                'url_prefix': 'some-prefix',
            }
        }
    )
    frontend = Frontend(
        stack,
        'TestFrontend2',
        props=FrontendProps(
            config=config_with_prefix,
            existing_resources=existing_resources,
            cpu=2048,
            memory_limit_mib=4096,
            desired_count=4,
            max_capacity=7,
        )
    )
    assert frontend.domain_name == 'some-prefix.my.test.domain.org'


def test_constructs_frontend_get_url_prefix():
    from infrastructure.config import Config
    from infrastructure.constructs.frontend import get_url_prefix
    config_without_prefix = Config(
        name='abc',
        branch='some-branch',
        backend_url='abc.123',
        frontend={},
        tags=[],
    )
    url_prefix = get_url_prefix(config_without_prefix)
    assert url_prefix == 'igvf-ui-some-branch'
    config_with_prefix = Config(
        name='abc',
        branch='some-branch',
        backend_url='abc.123',
        frontend={},
        tags=[],
        url_prefix='some-prefix',
    )
    url_prefix = get_url_prefix(config_with_prefix)
    assert url_prefix == 'some-prefix'
