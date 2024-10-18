import pytest

from aws_cdk.assertions import Template


def test_stacks_redis_initialize_redis_stack(config):
    from aws_cdk import App
    from infrastructure.stacks.redis import RedisStack
    from infrastructure.constructs.existing import igvf_dev
    app = App()
    redis_stack = RedisStack(
        app,
        'TestRedisStack',
        existing_resources_class=igvf_dev.Resources,
        config=config,
        env=igvf_dev.US_WEST_2,
    )
    template = Template.from_stack(redis_stack)
    template.has_resource_properties(
        'AWS::ElastiCache::CacheCluster',
        {
            'CacheNodeType': 'cache.t4g.small',
            'CacheSubnetGroupName': {
                'Ref': 'Redis71CfnSubnetGroup5B2B1282'
            },
            'Engine': 'redis',
            'EngineVersion': '7.1',
            'NumCacheNodes': 1,
            'Tags': [
                {
                    'Key': 'branch',
                    'Value': 'some-branch'
                }
            ],
            'VpcSecurityGroupIds': [
                {
                    'Fn::GetAtt': [
                        'Redis71SecurityGroup60C60F9B',
                        'GroupId'
                    ]
                }
            ]
        }
    )
    template.resource_count_is(
        'AWS::EC2::SecurityGroup',
        1
    )
    template.resource_count_is(
        'AWS::ElastiCache::SubnetGroup',
        1
    )
