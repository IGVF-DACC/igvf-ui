import pytest

from aws_cdk.assertions import Template


def test_stacks_frontend_initialize_frontend_stack(config):
    from aws_cdk import App
    from infrastructure.stacks.frontend import FrontendStack
    from infrastructure.constructs.existing import igvf_dev
    app = App()
    frontend_stack = FrontendStack(
        app,
        'TestFrontendStack',
        config=config,
        existing_resources_class=igvf_dev.Resources,
        env=igvf_dev.US_WEST_2,
    )
    template = Template.from_stack(frontend_stack)
    template.has_resource_properties(
        'AWS::ECS::Service',
        {
            'Cluster': {
                'Ref': 'EcsDefaultClusterMnL3mNNYNDemoVpc278C9613'
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
            'DesiredCount': 1,
            'EnableECSManagedTags': False,
            'EnableExecuteCommand': True,
            'HealthCheckGracePeriodSeconds': 60,
            'LaunchType': 'FARGATE',
            'LoadBalancers': [
                {
                    'ContainerName': 'nginxfe',
                    'ContainerPort': 80,
                    'TargetGroupArn': {
                        'Ref': 'FrontendFargateLBPublicListenerECSGroupB493F3AB'
                    }
                }
            ],
            'NetworkConfiguration': {
                'AwsvpcConfiguration': {
                    'AssignPublicIp': 'ENABLED',
                    'SecurityGroups': [
                        {
                            'Fn::GetAtt': [
                                'FrontendFargateServiceSecurityGroup52B6B765',
                                'GroupId'
                            ]
                        }
                    ],
                    'Subnets': [
                        's-12345',
                        's-67890'
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
                'Ref': 'FrontendFargateTaskDefC3798D1C'
            }
        }
    )
